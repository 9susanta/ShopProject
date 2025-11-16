# Round Four Code Review - Memory Leaks & Race Conditions

## 🔴 Critical Issues Found

### Frontend Memory Leaks

#### 1. **AuthService - setTimeout Not Tracked** ⚠️ MEDIUM
**Location**: `frontend/src/app/core/services/auth.service.ts:91`

**Issue**: 
- `setTimeout` in `initializeAuth()` is not tracked or cleared
- If service is destroyed before timeout fires, callback may execute on destroyed service
- No cleanup mechanism

**Impact**: Potential memory leak, callback executing on destroyed service

**Fix**: Track timeout ID and clear on service destruction (if service becomes destroyable)

---

#### 2. **CacheService - No Periodic Cleanup** ⚠️ MEDIUM
**Location**: `frontend/src/app/core/services/cache.service.ts:152-181`

**Issue**: 
- `cleanup()` only runs on service initialization
- Expired entries accumulate in memory and localStorage
- No periodic cleanup interval

**Impact**: Memory leak, localStorage bloat

**Fix**: Add periodic cleanup interval (e.g., every 5 minutes)

---

### Backend Race Conditions

#### 3. **CreateSaleCommandHandler - Inventory Race Condition** ⚠️ CRITICAL
**Location**: `src/Application/.../Commands/Sales/CreateSaleCommandHandler.cs:54-66, 83`

**Issue**: 
- Same race condition as CreatePOSSaleCommandHandler (fixed in round 3)
- Checks inventory, then completes sale without transaction
- Inventory reduction happens in event handler (async, outside transaction)

**Impact**: 
- Negative inventory possible
- Overselling products
- Data inconsistency

**Fix**: Apply same transaction-based fix as CreatePOSSaleCommandHandler

---

#### 4. **OutboxEventPublisher - Concurrent Event Processing Race** ⚠️ HIGH
**Location**: `src/Infrastructure/.../Services/OutboxEventPublisher.cs:53-77`

**Issue**: 
- Multiple instances/threads can process same events concurrently
- No locking mechanism (SELECT FOR UPDATE or optimistic concurrency)
- `MarkAsProcessed()` and `SaveChangesAsync()` not atomic

**Impact**: 
- Duplicate event processing
- Race conditions when multiple workers run

**Fix**: Use database-level locking (SELECT FOR UPDATE) or optimistic concurrency

---

#### 5. **ImportBackgroundWorker - Concurrent Product Processing Race** ⚠️ CRITICAL
**Location**: `src/Infrastructure/.../BackgroundServices/ImportBackgroundWorker.cs:182-193, 315-364`

**Issue**: 
- Multiple workers processing same product concurrently:
  - Both find product doesn't exist → both create it → duplicate products
  - Both find inventory doesn't exist → both create it → duplicate inventory
  - Both update inventory → stock count incorrect
- No transaction around `CreateOrUpdateProductAsync`
- No unique constraint handling

**Impact**: 
- Duplicate products/inventory entries
- Incorrect stock levels
- Data corruption

**Fix**: Use database transactions, unique constraints, or distributed locks

---

### Backend Performance Issues

#### 6. **GetDashboardQueryHandler - Loads All Data into Memory** ⚠️ HIGH
**Location**: `src/Application/.../Queries/Dashboard/GetDashboardQueryHandler.cs:41, 72, 86, 87, 98`

**Issue**: 
- `GetAllAsync()` loads ALL sales, products, inventories, imports into memory
- Filters in-memory instead of database
- Will cause performance issues as data grows

**Impact**: 
- High memory usage
- Slow queries
- Database connection exhaustion
- Application crashes with large datasets

**Fix**: Use database queries with WHERE clauses instead of loading all data

---

#### 7. **Similar Issues in Other Query Handlers** ⚠️ MEDIUM
**Location**: Multiple query handlers use `GetAllAsync()`

**Issue**: 
- `GetLowStockQueryHandler.cs:28-29`
- `GetExpirySoonQueryHandler.cs:28-29`
- `SearchProductsQueryHandler.cs:39`

**Impact**: Performance degradation as data grows

**Fix**: Replace with filtered database queries

---

## 📋 Summary

### Memory Leaks: 2 issues
- Frontend: 2 medium issues

### Race Conditions: 3 issues
- Backend: 3 critical/high issues

### Performance Issues: 4 issues
- Backend: 4 high/medium issues

### Total Issues: 9

---

## 🔧 Recommended Fix Priority

1. ✅ **CRITICAL**: Fix CreateSaleCommandHandler inventory race condition - **FIXED**
2. ✅ **CRITICAL**: Fix ImportBackgroundWorker concurrent product processing - **FIXED**
3. ✅ **HIGH**: Fix OutboxEventPublisher race condition - **FIXED**
4. ✅ **HIGH**: Fix GetDashboardQueryHandler performance (loads all data) - **PARTIALLY FIXED** (sales queries optimized, aggregations still need work)
5. ✅ **MEDIUM**: Fix CacheService periodic cleanup - **FIXED**
6. ⚠️ **MEDIUM**: Fix AuthService setTimeout tracking - **LOW PRIORITY** (singleton service, won't be destroyed)
7. ⚠️ **MEDIUM**: Fix other query handlers using GetAllAsync - **DOCUMENTED** (requires refactoring)

---

## ✅ Fixes Applied

### 1. CreateSaleCommandHandler - Inventory Race Condition (FIXED)
- **Solution**: Applied same transaction-based fix as CreatePOSSaleCommandHandler
- **Changes**:
  - Wrapped entire sale creation in database transaction with `Serializable` isolation
  - Inventory check and reduction now happen atomically within transaction
  - Double-check pattern before reduction
  - Proper error handling with transaction rollback

### 2. ImportBackgroundWorker - Concurrent Product Processing (FIXED)
- **Solution**: Wrapped batch processing in database transaction
- **Changes**:
  - Each batch processed within `Serializable` isolation transaction
  - Prevents duplicate products/inventory when multiple workers process same data
  - Added cancellation token checks in loop
  - Proper transaction commit/rollback

### 3. OutboxEventPublisher - Race Condition (FIXED)
- **Solution**: Added database transaction with serializable isolation and re-check pattern
- **Changes**:
  - Transaction prevents concurrent processing of same events
  - Re-check event status within transaction before processing
  - Proper error handling with transaction rollback

### 4. GetDashboardQueryHandler - Performance (PARTIALLY FIXED)
- **Solution**: Replaced `GetAllAsync()` with `FindAsync()` for filtered queries
- **Changes**:
  - Today's sales: Uses `FindAsync` with date filter (database-level)
  - Month's sales: Uses `FindAsync` with date range filter (database-level)
  - Products: Uses `FindAsync` with `Contains()` for IN clause (database-level)
  - **Remaining**: Low stock and expiry counts still use `GetAllAsync()` (requires domain method refactoring or database views)

### 5. CacheService - Periodic Cleanup (FIXED)
- **Solution**: Added periodic cleanup interval and dispose method
- **Changes**:
  - Cleanup runs every 5 minutes
  - Tracks interval ID for cleanup
  - Added `dispose()` method to clear interval and memory cache

---

## ⚠️ Remaining Issues

### AuthService - setTimeout Not Tracked
- **Impact**: Low (service is singleton, won't be destroyed)
- **Note**: setTimeout callback executes after 0ms, so risk is minimal
- **Recommended Fix**: Track timeout ID if service becomes destroyable

### GetDashboardQueryHandler - Aggregations Still Load All Data
- **Impact**: Performance degradation with large datasets
- **Recommended Fix**: 
  - Create database views for low stock and expiry counts
  - Or add specialized repository methods with direct DbContext access
  - Or refactor domain methods to support database-level queries

### Other Query Handlers Using GetAllAsync
- **Impact**: Performance issues as data grows
- **Affected Files**:
  - `GetLowStockQueryHandler.cs`
  - `GetExpirySoonQueryHandler.cs`
  - `SearchProductsQueryHandler.cs`
- **Recommended Fix**: Replace with `FindAsync()` or direct DbContext queries

