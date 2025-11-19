# Login Troubleshooting Guide

## Quick Checks

### 1. Verify API is Running
- Open: http://localhost:5120/swagger
- If Swagger loads, API is running ✅
- If not, start API: `cd src/API/GroceryStoreManagement.API && dotnet run`

### 2. Verify Frontend is Running
- Open: http://localhost:4200
- If login page loads, frontend is running ✅
- If not, start frontend: `cd frontend && npm start`

### 3. Test Credentials
Use these test credentials:
- **Email:** `admin@test.com`
- **Password:** `Admin123!`

Or:
- **Email:** `superadmin@test.com`
- **Password:** `SuperAdmin123!`

### 4. Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Try to login
4. Look for error messages

### 5. Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try to login
4. Find the `/auth/login` request
5. Check:
   - **Status Code:** Should be 200 for success
   - **Request URL:** Should be `http://localhost:5120/api/auth/login`
   - **Request Payload:** Should contain email and password
   - **Response:** Should contain `accessToken` and `user` object

## Common Issues & Solutions

### Issue 1: "Unable to connect to server"
**Cause:** API is not running
**Solution:**
```powershell
cd src/API/GroceryStoreManagement.API
dotnet run
```

### Issue 2: "Invalid email or password"
**Causes:**
- Wrong credentials
- Account is locked
- Account is inactive

**Solutions:**
1. Verify credentials (see Test Credentials above)
2. Check if account is locked:
   - Use unlock endpoint: `POST /api/users/{id}/unlock`
   - Or wait for auto-unlock (15 minutes)
3. Check if account is active (Admin can activate via API)

### Issue 3: "Account is locked"
**Cause:** Too many failed login attempts (5 attempts = 15 min lockout)
**Solutions:**
1. Wait 15 minutes for auto-unlock
2. Admin can unlock: `POST /api/users/{id}/unlock`
3. Admin can reset attempts: `POST /api/users/{id}/reset-failed-attempts`

### Issue 4: CORS Error
**Cause:** CORS not configured correctly
**Solution:** API already has CORS configured with `AllowAll` policy. If still seeing CORS errors:
1. Check API is running on port 5120
2. Check frontend is running on port 4200
3. Verify `environment.ts` has correct `apiUrl`

### Issue 5: Login succeeds but redirect fails
**Cause:** Router or guard issue
**Solution:**
1. Check browser console for navigation errors
2. Verify user role is correct
3. Check if route exists: `/admin/dashboard`

## Manual API Test

Test login directly via API:

```powershell
# PowerShell
$body = @{
    email = "admin@test.com"
    password = "Admin123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5120/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

Or using curl:
```bash
curl -X POST http://localhost:5120/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'
```

Expected response:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "...",
  "expiresIn": 900,
  "user": {
    "id": "...",
    "email": "admin@test.com",
    "name": "Admin User",
    "role": 1,
    ...
  }
}
```

## Debug Steps

1. **Check API Logs**
   - Look for login attempts in API console
   - Check for error messages

2. **Check Frontend Logs**
   - Open browser console
   - Look for login response
   - Check for error messages

3. **Verify Environment Configuration**
   - `frontend/src/environments/environment.ts`
   - `apiUrl` should be: `http://localhost:5120/api`

4. **Check Database**
   - Verify users exist in database
   - Check if passwords are hashed correctly
   - Verify account is not locked

5. **Test with Different Browser**
   - Sometimes browser cache causes issues
   - Try incognito/private mode

## Reset Test Users

If test users don't work, reset database:

```powershell
# Via API (if TestController exists)
POST http://localhost:5120/api/test/reset-seed
```

Or manually via database:
```sql
-- Reset password for admin user
-- Note: This requires rehashing password
```

## Still Not Working?

1. Check API is actually running:
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like "*GroceryStoreManagement*"}
   ```

2. Check port 5120 is not in use:
   ```powershell
   netstat -ano | findstr :5120
   ```

3. Check frontend port 4200:
   ```powershell
   netstat -ano | findstr :4200
   ```

4. Restart both services:
   - Stop API (Ctrl+C)
   - Stop Frontend (Ctrl+C)
   - Start API: `dotnet run` (in API directory)
   - Start Frontend: `npm start` (in frontend directory)


