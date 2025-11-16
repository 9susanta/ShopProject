# Round Two Code Review - Race Conditions & Memory Leaks

## 🔴 Critical Issues Found

### Frontend Memory Leaks

#### 1. **DashboardComponent - Unsubscribed Observables**
**Location**: `frontend/src/app/admin/dashboard/dashboard.component.ts:32, 53`

**Issue**: Two subscriptions are never unsubscribed:
- `route.data.subscribe()` (line 32)
- `dashboardService.getDashboardData().subscribe()` (line 53)

**Impact**: Memory leak when navigating away from dashboard

**Fix**: Implement `OnDestroy` and unsubscribe

---

#### 2. **POS Component - Nested Subscription Not Managed**
**Location**: `frontend/src/app/pos/pos.component.ts:139`

**Issue**: `searchProducts(term).subscribe()` inside debounced search is not added to `subscriptions` collection

**Impact**: Search subscriptions accumulate on each keystroke

**Fix**: Add nested subscription to `subscriptions` collection

---

#### 3. **SignalR Service - No Cleanup**
**Location**: `frontend/src/app/core/services/signalr.service.ts`

**Issue**: 
- Service is singleton but never disposes hub connection
- Timer in constructor never cleaned up
- No `ngOnDestroy` equivalent for services

**Impact**: SignalR connection remains active, memory leak

**Fix**: Add cleanup method, dispose in app destroy

---

#### 4. **Login Component - setTimeout Not Cleared**
**Location**: `frontend/src/app/auth/login/login.component.ts:39, 72, 86`

**Issue**: Multiple `setTimeout` calls that are never cleared if component is destroyed before timeout

**Impact**: Callbacks execute after component destruction, potential errors

**Fix**: Store timeout IDs and clear in `ngOnDestroy`

---

### Frontend Race Conditions

#### 5. **POS Component - Concurrent Search Requests**
**Location**: `frontend/src/app/pos/pos.component.ts:139`

**Issue**: Multiple search requests can fire concurrently, results may arrive out of order

**Impact**: UI shows incorrect search results

**Fix**: Use `switchMap` to cancel previous requests

---

#### 6. **Dashboard Component - Multiple Data Loads**
**Location**: `frontend/src/app/admin/dashboard/dashboard.component.ts:41, 47`

**Issue**: `loadDashboardData()` can be called multiple times if resolver fails and error handler also calls it

**Impact**: Multiple concurrent API calls, wasted resources

**Fix**: Add loading flag to prevent concurrent calls

---

### Backend Race Conditions

#### 7. **AuthService - Refresh Token Race Condition** ⚠️ CRITICAL
**Location**: `src/Infrastructure/.../Services/AuthService.cs:134-176`

**Issue**: 
```csharp
// Thread 1: Finds token active
var refreshToken = await _context.Set<RefreshToken>()
    .FirstOrDefaultAsync(rt => rt.TokenHash == refreshTokenHash, cancellationToken);

// Thread 2: Also finds same token active (before Thread 1 revokes it)
// Both threads revoke and create new tokens
refreshToken.RevokedAt = DateTime.UtcNow; // Thread 1
refreshToken.RevokedAt = DateTime.UtcNow; // Thread 2 (overwrites)
```

**Impact**: 
- Multiple refresh tokens can be created for same request
- Security issue: old token might not be properly revoked
- Database inconsistency

**Fix**: Use database-level optimistic concurrency or pessimistic locking

---

#### 8. **RateLimitService - GetOrAdd Race Condition**
**Location**: `src/Infrastructure/.../Services/RateLimitService.cs:23`

**Issue**: `ConcurrentDictionary.GetOrAdd` with `new RateLimitWindow(window)` can create multiple windows if called concurrently

**Impact**: Rate limiting may not work correctly under high concurrency

**Fix**: Use `GetOrAdd` with factory function properly, or use `Lazy<T>`

---

#### 9. **ImportBackgroundWorker - Concurrent Product Processing**
**Location**: `src/Infrastructure/.../BackgroundServices/ImportBackgroundWorker.cs:315-364`

**Issue**: Multiple workers processing same product concurrently can cause:
- Duplicate inventory entries
- Race condition in product lookup/update
- Inconsistent stock levels

**Impact**: Data corruption, incorrect inventory counts

**Fix**: Use database transactions with proper isolation levels, or use distributed locks

---

#### 10. **CachedRepository - Cache Invalidation Race**
**Location**: `src/Infrastructure/.../Repositories/CachedRepository.cs:73-100`

**Issue**: 
```csharp
// Thread 1: Updates entity
await _repository.UpdateAsync(entity, cancellationToken);
await _cacheService.RemoveAsync(cacheKey); // Thread 1 removes cache

// Thread 2: Reads entity (cache miss, fetches from DB)
// Thread 1: Invalidates all cache
await InvalidateCacheAsync(); // Thread 1 invalidates

// Thread 2: Caches stale data
await _cacheService.SetAsync(cacheKey, entityList, ...); // Thread 2 caches old data
```

**Impact**: Stale data in cache, inconsistent reads

**Fix**: Use cache versioning or atomic cache operations

---

## 🟡 High Priority Issues

### Backend Memory Leaks

#### 11. **RateLimitService - Timer Never Disposed**
**Location**: `src/Infrastructure/.../Services/RateLimitService.cs:12, 17`

**Issue**: `Timer` created in constructor is never disposed

**Impact**: Timer continues running after service disposal, memory leak

**Fix**: Implement `IDisposable` and dispose timer

---

#### 12. **RateLimitService - Unbounded Memory Growth**
**Location**: `src/Infrastructure/.../Services/RateLimitService.cs:101`

**Issue**: `List<DateTime> Requests` grows unbounded, cleanup only every 5 minutes

**Impact**: Memory usage grows indefinitely under high traffic

**Fix**: Use circular buffer or more aggressive cleanup

---

## 📋 Summary

### Memory Leaks: 6 issues
- Frontend: 4 issues
- Backend: 2 issues

### Race Conditions: 4 issues
- Frontend: 2 issues
- Backend: 2 critical issues

### Total Issues: 10

---

## 🔧 Recommended Fix Priority

1. **CRITICAL**: Fix refresh token race condition (AuthService)
2. **CRITICAL**: Fix dashboard component memory leaks
3. **HIGH**: Fix POS component subscription leak
4. **HIGH**: Fix import worker concurrent processing
5. **MEDIUM**: Fix SignalR cleanup
6. **MEDIUM**: Fix setTimeout cleanup in login
7. **MEDIUM**: Fix cache invalidation race
8. **LOW**: Fix rate limit timer disposal
9. **LOW**: Fix rate limit memory growth

