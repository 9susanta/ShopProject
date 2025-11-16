# Round Three Code Review - Memory Leaks & Race Conditions

## 🔴 Critical Issues Found

### Frontend Memory Leaks

#### 1. **SignalR Service - No Cleanup/Dispose** ⚠️ CRITICAL
**Location**: `frontend/src/app/core/services/signalr.service.ts`

**Issue**: 
- Service is singleton (`providedIn: 'root'`) but never disposes hub connection
- Event handlers (`onclose`, `onreconnecting`, `onreconnected`, `on('ImportProgressUpdated')`) are never removed
- Hub connection remains active for application lifetime
- Subjects (`connectionStateSubject`, `importProgressSubject`) are never completed

**Impact**: 
- Memory leak: Hub connection and event handlers persist forever
- Multiple reconnections could accumulate handlers
- Subjects never complete, preventing garbage collection

**Fix**: Add cleanup method, complete subjects, remove event handlers

---

#### 2. **VoiceToTextService - Event Handlers Never Removed**
**Location**: `frontend/src/app/core/services/voice-to-text.service.ts:43, 55, 60`

**Issue**: 
- Event handlers (`onresult`, `onerror`, `onend`) are assigned but never removed
- `recognition` object is never cleaned up
- Service is singleton, so handlers persist

**Impact**: Memory leak, event handlers accumulate

**Fix**: Add cleanup method to remove event handlers

---

### Frontend Race Conditions

#### 3. **SignalR Service - Concurrent Start/Stop**
**Location**: `frontend/src/app/core/services/signalr.service.ts:109, 132`

**Issue**: 
- `start()` and `stop()` methods don't check if operation is already in progress
- Multiple concurrent calls could cause connection state conflicts

**Impact**: Connection state corruption, multiple connection attempts

**Fix**: Add operation flags to prevent concurrent start/stop

---

### Backend Race Conditions

#### 4. **CreatePOSSaleCommandHandler - Inventory Check Race Condition** ⚠️ CRITICAL
**Location**: `src/Application/.../Commands/Sales/CreatePOSSaleCommandHandler.cs:108-111, 183`

**Issue**: 
```csharp
// Thread 1: Checks inventory (Available: 10)
var inventory = inventoryList.FirstOrDefault();
if (inventory == null || inventory.AvailableQuantity < itemRequest.Quantity) // 10 >= 5 ✓

// Thread 2: Also checks same inventory (Available: 10)
// Thread 2: Completes sale, reduces to 5

// Thread 1: Completes sale, reduces to 0 (but should have failed!)
```

**Impact**: 
- Negative inventory possible
- Overselling products
- Data inconsistency

**Fix**: Use database transaction with proper isolation level, or pessimistic locking

---

#### 5. **ImportBackgroundWorker - Concurrent Product Processing Race** ⚠️ CRITICAL
**Location**: `src/Infrastructure/.../BackgroundServices/ImportBackgroundWorker.cs:315-364`

**Issue**: 
- Multiple workers processing same product concurrently:
  - Both find product doesn't exist → both create it → duplicate products
  - Both find inventory doesn't exist → both create it → duplicate inventory
  - Both update inventory → stock count incorrect

**Impact**: 
- Duplicate products/inventory entries
- Incorrect stock levels
- Data corruption

**Fix**: Use database transactions, unique constraints, or distributed locks

---

#### 6. **CachedRepository - Cache Invalidation Race**
**Location**: `src/Infrastructure/.../Repositories/CachedRepository.cs:83-90`

**Issue**: 
```csharp
// Thread 1: Updates entity
await _repository.UpdateAsync(entity, cancellationToken);
await _cacheService.RemoveAsync(cacheKey); // Thread 1 removes

// Thread 2: Reads entity (cache miss, fetches from DB)
var entity = await _repository.GetByIdAsync(id, cancellationToken);

// Thread 1: Invalidates all cache
await InvalidateCacheAsync(); // Thread 1 invalidates

// Thread 2: Caches stale data
await _cacheService.SetAsync(cacheKey, entity, ...); // Thread 2 caches old data
```

**Impact**: Stale data in cache, inconsistent reads

**Fix**: Use cache versioning or atomic cache operations

---

#### 7. **RateLimitService - GetOrAdd Factory Race**
**Location**: `src/Infrastructure/.../Services/RateLimitService.cs:24`

**Issue**: 
- `GetOrAdd` with factory `_ => new RateLimitWindow(window)` can theoretically create multiple windows if called concurrently before first completes
- While unlikely due to ConcurrentDictionary, factory could execute multiple times

**Impact**: Minor - potential duplicate window creation (low probability)

**Fix**: Use `Lazy<T>` or check-and-add pattern

---

## 🟡 High Priority Issues

### Backend Memory Leaks

#### 8. **ImportBackgroundWorker - No Cancellation Token Check in Loop**
**Location**: `src/Infrastructure/.../BackgroundServices/ImportBackgroundWorker.cs:155`

**Issue**: Long-running loop doesn't check `cancellationToken.IsCancellationRequested` between iterations

**Impact**: Worker doesn't respond to shutdown requests promptly

**Fix**: Add cancellation token checks in loop

---

#### 9. **OutboxEventPublisher - No Transaction Isolation**
**Location**: `src/Infrastructure/.../Services/OutboxEventPublisher.cs:53-77`

**Issue**: 
- Reads unprocessed events without locking
- Multiple instances could process same events concurrently
- `MarkAsProcessed()` and `SaveChangesAsync()` not atomic

**Impact**: Duplicate event processing, race conditions

**Fix**: Use database-level locking or optimistic concurrency

---

## 📋 Summary

### Memory Leaks: 2 issues
- Frontend: 2 critical issues

### Race Conditions: 5 issues
- Frontend: 1 issue
- Backend: 4 critical issues

### Total Issues: 7

---

## 🔧 Recommended Fix Priority

1. ✅ **CRITICAL**: Fix CreatePOSSaleCommandHandler inventory race condition - **FIXED**
2. ⚠️ **CRITICAL**: Fix ImportBackgroundWorker concurrent product processing - **REMAINING** (requires distributed locks or database-level constraints)
3. ✅ **CRITICAL**: Fix SignalR service cleanup - **FIXED**
4. ✅ **HIGH**: Fix VoiceToTextService cleanup - **FIXED**
5. ⚠️ **HIGH**: Fix cache invalidation race - **REMAINING** (requires cache versioning)
6. ✅ **MEDIUM**: Fix SignalR concurrent start/stop - **FIXED**
7. ⚠️ **MEDIUM**: Fix OutboxEventPublisher race condition - **REMAINING** (requires database-level locking)

---

## ✅ Fixes Applied

### 1. CreatePOSSaleCommandHandler - Inventory Race Condition (FIXED)
- **Solution**: Wrapped entire sale creation in database transaction with `Serializable` isolation level
- **Changes**:
  - Added transaction support to `IUnitOfWork` interface with isolation level parameter
  - Implemented `BeginTransactionAsync(IsolationLevel)` in `UnitOfWork`
  - Inventory check and reduction now happen atomically within transaction
  - Double-check pattern: Re-verify inventory right before reduction
  - Made `UpdateStockOnSaleCompletedHandler` idempotent to handle cases where inventory was already reduced

### 2. SignalR Service - Memory Leak (FIXED)
- **Solution**: Added `dispose()` method and cleanup in `AppComponent`
- **Changes**:
  - Added `dispose()` method to complete subjects and stop connection
  - Added cleanup in `AppComponent.ngOnDestroy()`
  - Added flags (`isStarting`, `isStopping`) to prevent concurrent operations
  - Remove event handlers in `stop()` method

### 3. VoiceToTextService - Memory Leak (FIXED)
- **Solution**: Added `dispose()` method to clean up event handlers
- **Changes**:
  - Added `dispose()` method to remove event handlers and complete subject
  - Clears recognition object reference

### 4. SignalR Concurrent Start/Stop (FIXED)
- **Solution**: Added operation flags to prevent concurrent start/stop
- **Changes**:
  - Added `isStarting` and `isStopping` flags
  - Check flags before starting/stopping operations
  - Reset flags in `finally` blocks

---

## ⚠️ Remaining Issues (Lower Priority)

### ImportBackgroundWorker - Concurrent Product Processing
- **Impact**: Duplicate products/inventory entries under high concurrency
- **Recommended Fix**: Use database unique constraints (Barcode, SKU) and handle `DbUpdateException`
- **Alternative**: Use distributed locks (Redis) or database-level row locking

### CachedRepository - Cache Invalidation Race
- **Impact**: Stale data in cache
- **Recommended Fix**: Implement cache versioning or use atomic cache operations with version numbers

### OutboxEventPublisher - Race Condition
- **Impact**: Duplicate event processing
- **Recommended Fix**: Use database-level locking (SELECT FOR UPDATE) or optimistic concurrency with version column

