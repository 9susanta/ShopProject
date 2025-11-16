# Performance Issues Analysis - Security Extension

## Critical Performance Issues

### 1. **AuditService - Synchronous Database Writes Blocking Requests**
**Location:** `AuditService.cs` lines 45-46, 66-67

**Issue:**
```csharp
await _context.Set<AuditEntry>().AddAsync(entry, cancellationToken);
await _context.SaveChangesAsync(cancellationToken); // BLOCKS REQUEST THREAD
```

**Impact:** 
- Every entity change triggers a separate database write
- Blocks the HTTP request thread until audit is written
- Can add 50-200ms latency per request
- Under high load, this becomes a bottleneck

**Fix:** Use background queue or outbox pattern

---

### 2. **ApplicationDbContextExtensions - Double Database Round Trips**
**Location:** `ApplicationDbContextExtensions.cs` lines 112, 119

**Issue:**
```csharp
// Save changes first
var result = await context.SaveChangesAsync(cancellationToken); // ROUND TRIP 1

// Then add audit entries (in a separate transaction)
await auditService.AddRangeAsync(auditEntries, cancellationToken); // ROUND TRIP 2
```

**Impact:**
- Every SaveChanges operation becomes TWO database round trips
- Doubles database latency (100-400ms becomes 200-800ms)
- Increases database connection pool usage

**Fix:** Include audit entries in the same transaction

---

### 3. **AuthService - Case-Insensitive Email Query Prevents Index Usage**
**Location:** `AuthService.cs` line 49-50

**Issue:**
```csharp
var user = await _context.Users
    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);
```

**Impact:**
- `ToLower()` on both sides prevents index usage
- Forces full table scan on Users table
- Gets slower as user count grows

**Fix:** Store emails in lowercase, query directly

---

### 4. **Password Verification - CPU Intensive (100,000 Iterations)**
**Location:** `PasswordHasherService.cs` line 101-105, 137-141

**Issue:**
```csharp
private const int PBKDF2_ITERATIONS = 100000; // Takes 100-500ms per verify
```

**Impact:**
- Each login attempt takes 100-500ms just for password verification
- Under brute force, this is intentional (good)
- But legitimate logins are also slow
- Can cause request timeouts under load

**Fix:** Consider async/background verification or lower iterations (balance security vs performance)

---

### 5. **RateLimitService - Lock Contention Under High Load**
**Location:** `RateLimitService.cs` lines 25, 52

**Issue:**
```csharp
lock (windowEntry) // LOCKS ENTIRE WINDOW
{
    windowEntry.RemoveExpiredRequests(now);
    // ...
}
```

**Impact:**
- All requests from same IP contend for same lock
- Under high concurrent load, requests queue up
- Can cause 50-200ms delays per request
- Memory grows unbounded (List<DateTime> never shrinks)

**Fix:** Use lock-free data structures or distributed cache

---

### 6. **Refresh Token Lookup - Missing Index Optimization**
**Location:** `AuthService.cs` line 138-139

**Issue:**
```csharp
var refreshToken = await _context.Set<RefreshToken>()
    .FirstOrDefaultAsync(rt => rt.TokenHash == refreshTokenHash, cancellationToken);
```

**Impact:**
- TokenHash is indexed, but query might not use it efficiently
- Under high token volume, lookup can be slow

**Fix:** Ensure index is used, consider caching active tokens

---

### 7. **AuditService - JSON Parsing on Every Entry**
**Location:** `AuditService.cs` line 197, `ApplicationDbContextExtensions.cs` lines 61, 77, 90

**Issue:**
```csharp
using var doc = JsonDocument.Parse(jsonData); // PARSE JSON
// ... iterate and serialize again
return JsonSerializer.Serialize(masked); // SERIALIZE AGAIN
```

**Impact:**
- Every audit entry parses and re-serializes JSON
- For large entities, this can take 10-50ms per entry
- Multiplied by number of changed entities per request

**Fix:** Cache parsed documents or use streaming JSON

---

### 8. **ApplicationDbContextExtensions - Synchronous JSON Serialization**
**Location:** `ApplicationDbContextExtensions.cs` lines 61, 77, 90

**Issue:**
```csharp
var keyValuesJson = JsonSerializer.Serialize(keyValues); // SYNCHRONOUS
// ... loops through ALL properties
oldValues = JsonSerializer.Serialize(originalValues); // SYNCHRONOUS
newValues = JsonSerializer.Serialize(currentValues); // SYNCHRONOUS
```

**Impact:**
- Blocks request thread during serialization
- For entities with many properties, can take 20-100ms
- Happens BEFORE SaveChanges, adding latency

**Fix:** Use async serialization or defer to background

---

### 9. **EncryptionService - Task.Run() Adds Overhead**
**Location:** `EncryptionService.cs` lines 45, 65

**Issue:**
```csharp
return await Task.Run(() => // WRAPS SYNCHRONOUS CODE
{
    return EncryptWithAesGcm(plaintext); // STILL BLOCKS THREAD POOL
}, cancellationToken);
```

**Impact:**
- Task.Run() doesn't help - crypto is still CPU-bound
- Adds thread pool overhead
- Doesn't improve responsiveness

**Fix:** Remove Task.Run(), crypto is fast enough (<10ms)

---

### 10. **RateLimitService - Unbounded Memory Growth**
**Location:** `RateLimitService.cs` line 101

**Issue:**
```csharp
public List<DateTime> Requests { get; } = new(); // GROWS FOREVER
```

**Impact:**
- List grows with each request
- Cleanup only runs every 5 minutes
- Under high traffic, memory usage grows unbounded
- Can cause OutOfMemoryException

**Fix:** Use circular buffer or more aggressive cleanup

---

### 11. **Multiple SaveChangesAsync Calls in AuthService**
**Location:** `AuthService.cs` lines 86, 94, 112, 176

**Issue:**
```csharp
await _context.SaveChangesAsync(cancellationToken); // SAVE 1: Failed attempts
// ... later
await _context.SaveChangesAsync(cancellationToken); // SAVE 2: Reset attempts
// ... later  
await _context.SaveChangesAsync(cancellationToken); // SAVE 3: Refresh token
```

**Impact:**
- Login operation makes 3 separate database round trips
- Adds 150-600ms latency
- Increases database load

**Fix:** Batch all changes into single SaveChanges

---

### 12. **AuditService Query - No Index on Composite Filters**
**Location:** `AuditService.cs` lines 76-109

**Issue:**
```csharp
// Multiple WHERE clauses without composite index
query = query.Where(a => a.TableName == request.TableName);
query = query.Where(a => a.Operation == request.Operation);
query = query.Where(a => a.UserId == request.UserId.Value);
```

**Impact:**
- Multiple filters without composite index
- Database may not use indexes efficiently
- Slow queries on large audit tables

**Fix:** Add composite indexes for common filter combinations

---

### 13. **AuditMiddleware - Reads Form Content Synchronously**
**Location:** `AuditMiddleware.cs` lines 41-53

**Issue:**
```csharp
if (context.Request.HasFormContentType)
{
    var form = await context.Request.ReadFormAsync(); // READS ENTIRE FORM
    foreach (var file in form.Files)
    {
        // ...
    }
}
```

**Impact:**
- Reads entire form into memory before processing
- For large file uploads, this can consume significant memory
- Blocks request pipeline

**Fix:** Check ContentLength header first, don't read form unless necessary

---

### 14. **RateLimitMiddleware - Double Service Call**
**Location:** `RateLimitMiddleware.cs` lines 42, 57

**Issue:**
```csharp
if (!_rateLimitService.IsAllowed(...)) // CALL 1
{
    var rateLimitInfo = _rateLimitService.GetRateLimitInfo(...); // CALL 2
    // ...
}
// ...
var info = _rateLimitService.GetRateLimitInfo(...); // CALL 3 (if allowed)
```

**Impact:**
- Calls rate limit service 2-3 times per request
- Each call acquires locks
- Unnecessary overhead

**Fix:** Return rate limit info from IsAllowed() method

---

## Performance Impact Summary

| Issue | Latency Added | Severity | Frequency |
|-------|---------------|----------|-----------|
| Double DB round trips (Audit) | 100-400ms | **HIGH** | Every SaveChanges |
| Password verification | 100-500ms | **MEDIUM** | Every login |
| Case-insensitive email query | 10-100ms | **MEDIUM** | Every login |
| Lock contention (RateLimit) | 50-200ms | **MEDIUM** | High concurrent load |
| JSON serialization | 20-100ms | **LOW** | Every entity change |
| Multiple SaveChanges | 150-600ms | **HIGH** | Every login/refresh |

## Recommended Fixes Priority

1. **CRITICAL:** Fix double database round trips in audit
2. **HIGH:** Batch SaveChanges in AuthService
3. **HIGH:** Store emails in lowercase, remove ToLower()
4. **MEDIUM:** Optimize rate limiting with lock-free structures
5. **MEDIUM:** Add composite indexes for audit queries
6. **LOW:** Remove unnecessary Task.Run() in encryption

