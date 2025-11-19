# Account Lockout Implementation

## Overview
The account lockout mechanism prevents brute-force attacks by locking accounts after multiple failed login attempts. This is production-ready and includes automatic unlock and admin unlock capabilities.

## Configuration

### Settings (appsettings.json)
```json
{
  "Security": {
    "MaxFailedLoginAttempts": 5,        // Lock after 5 failed attempts
    "LockoutDurationMinutes": 15,        // Lock for 15 minutes
    "RefreshTokenExpirationDays": 7
  }
}
```

## Features

### 1. Automatic Lockout
- After 5 failed login attempts, account is locked for 15 minutes
- Failed attempts counter is incremented on each failed login
- Lockout timestamp is stored in database

### 2. Auto-Unlock
- Accounts automatically unlock after lockout duration expires
- Auto-unlock happens on next login attempt
- Failed attempts counter is reset on successful login

### 3. Manual Unlock (Admin)
- Admins can unlock accounts via API endpoint
- Endpoint: `POST /api/users/{id}/unlock`
- Requires Admin or SuperAdmin role

### 4. Reset Failed Attempts (Admin)
- Admins can reset failed login attempts counter
- Endpoint: `POST /api/users/{id}/reset-failed-attempts`
- Useful if account is approaching lockout threshold

### 5. Lockout Status Check
- Admins can check lockout status of any user
- Endpoint: `GET /api/users/{id}/lockout-status`
- Returns: isLocked, failedLoginAttempts, lockoutUntil, remainingMinutes

## API Endpoints

### Unlock Account
```
POST /api/users/{id}/unlock
Authorization: Bearer {admin_token}
Response: { "message": "Account unlocked successfully" }
```

### Reset Failed Attempts
```
POST /api/users/{id}/reset-failed-attempts
Authorization: Bearer {admin_token}
Response: { "message": "Failed login attempts reset successfully" }
```

### Get Lockout Status
```
GET /api/users/{id}/lockout-status
Authorization: Bearer {admin_token}
Response: {
  "isLocked": false,
  "failedLoginAttempts": 2,
  "lockoutUntil": null,
  "remainingMinutes": 0,
  "willAutoUnlock": false
}
```

## User Experience

### Locked Account Login
- User sees: "Account is locked. Please try again in X minute(s)."
- Shows remaining lockout time
- Account auto-unlocks after duration expires

### Successful Login
- Failed attempts counter is reset to 0
- Lockout is cleared
- User can login normally

## Database Schema

### User Entity Fields
- `FailedLoginAttempts` (int): Current count of failed attempts
- `LockoutUntil` (DateTime?): Timestamp when lockout expires
- `IsLocked()` (method): Returns true if currently locked

## Security Considerations

1. **Production Ready**: Lockout mechanism is fully functional
2. **Configurable**: Thresholds can be adjusted in appsettings.json
3. **Audit Logging**: All lockout events are logged
4. **Admin Override**: Admins can unlock accounts if needed
5. **Auto-Recovery**: Accounts unlock automatically after duration

## Testing

To test lockout:
1. Attempt login with wrong password 5 times
2. Account will be locked
3. Try login again - should see lockout message
4. Wait 15 minutes OR use admin unlock endpoint
5. Account will be unlocked

## Files Modified

1. `AuthService.cs` - Added auto-unlock logic and unlock methods
2. `UsersController.cs` - Added unlock endpoints
3. `UserDto.cs` - Added lockout status fields
4. `User.cs` - Already had lockout methods


