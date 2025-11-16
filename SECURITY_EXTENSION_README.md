# Security & Data Protection Extension

This document describes the security and data protection features added to the Grocery Store Management System.

## Features Implemented

### 1. Authentication & Authorization
- **JWT Access Tokens**: 15-minute lifetime, signed with HS256
- **Refresh Tokens**: 7-30 day lifetime, stored hashed (HMAC-SHA256) in database
- **Token Rotation**: Old refresh tokens are revoked when new ones are issued
- **Token Revocation**: Support for revoking individual or all user tokens

### 2. Password Security
- **Argon2id Support**: Preferred algorithm (requires Konscious.Security.Cryptography package)
- **PBKDF2 Fallback**: High iteration count (100,000) with SHA-256
- **Password Metadata**: Algorithm, salt, and iterations stored in User table

### 3. Account Lockout
- **Failed Login Tracking**: Increments on each failed attempt
- **Automatic Lockout**: After 5 failed attempts (configurable)
- **Lockout Duration**: 15 minutes (configurable)
- **Admin Unlock**: Admins can unlock accounts via API

### 4. Audit Logging
- **Automatic Tracking**: All Create/Update/Delete operations
- **Rich Metadata**: User, IP, correlation ID, request path, timestamps
- **Sensitive Field Masking**: Passwords and tokens are masked in audit logs
- **Query API**: Admin endpoints to query audit logs with filters

### 5. Data Encryption at Rest
- **AES-GCM Encryption**: Preferred algorithm (authenticated encryption)
- **AES-CBC Fallback**: With HMAC for authentication
- **Config-Driven**: Encryption key from appsettings or environment variable
- **Key Rotation**: Framework for rotating encryption keys (stub implementation)

### 6. Rate Limiting
- **In-Memory Sliding Window**: Per IP or user ID
- **Configurable Limits**: Default 5 requests per 15 minutes
- **Sensitive Endpoints**: Applied to login, OTP, refresh token endpoints

### 7. Security Headers
- **HSTS**: Force HTTPS connections
- **X-Frame-Options**: Prevent clickjacking
- **X-Content-Type-Options**: Prevent MIME sniffing
- **CSP**: Content Security Policy
- **Permissions Policy**: Restrict browser features

## Configuration

### appsettings.json

```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyForJWTTokenGenerationThatShouldBeAtLeast32Characters",
    "Issuer": "GroceryStoreManagement",
    "Audience": "GroceryStoreManagement",
    "ExpirationInMinutes": 15,
    "RefreshTokenExpirationInDays": 7
  },
  "Security": {
    "MaxFailedLoginAttempts": 5,
    "LockoutDurationMinutes": 15,
    "RefreshTokenExpirationInDays": 7
  },
  "Encryption": {
    "Key": "GenerateA256BitKeyUsingDotnetUserSecretsOrEnvironmentVariable"
  },
  "RateLimit": {
    "MaxRequests": 5,
    "WindowMinutes": 15
  },
  "Audit": {
    "MaskedFields": [
      "Password",
      "PasswordHash",
      "RefreshToken",
      "TokenHash",
      "Secret",
      "ApiKey"
    ]
  }
}
```

### Environment Variables (Recommended for Production)

```bash
# JWT Secret Key (at least 32 characters)
JwtSettings__SecretKey=YourProductionSecretKeyHere

# Encryption Key (256-bit base64 encoded)
Encryption__Key=Your256BitEncryptionKeyBase64Encoded

# Security Settings
Security__MaxFailedLoginAttempts=5
Security__LockoutDurationMinutes=15
Security__RefreshTokenExpirationDays=7

# Rate Limiting
RateLimit__MaxRequests=5
RateLimit__WindowMinutes=15
```

## Generating Encryption Keys

### Generate 256-bit Encryption Key

```bash
# Using .NET CLI
dotnet user-secrets set "Encryption:Key" "$(openssl rand -base64 32)"

# Or using PowerShell
$key = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
dotnet user-secrets set "Encryption:Key" $key

# Or manually generate and set in environment variable
```

### Generate JWT Secret Key

```bash
# Using .NET CLI
dotnet user-secrets set "JwtSettings:SecretKey" "$(openssl rand -base64 32)"

# Or manually create a 32+ character string
```

## Key Rotation

### Encryption Key Rotation

1. Generate new encryption key
2. Create a background service to:
   - Read all encrypted columns
   - Decrypt with old key
   - Re-encrypt with new key
   - Update records in batches
3. Update configuration with new key
4. Restart application

**Note**: Key rotation is a complex operation and should be done during maintenance windows.

### JWT Secret Key Rotation

1. Generate new secret key
2. Update configuration
3. Restart application
4. All existing tokens will be invalid (users need to re-login)

## Database Migrations

Run the following to apply the security extension migrations:

```bash
cd src/API/GroceryStoreManagement.API
dotnet ef database update --project ../../Infrastructure/GroceryStoreManagement.Infrastructure
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Revoke refresh token(s)
- `GET /api/auth/me` - Get current user info

### Admin Audit

- `GET /api/admin/audits` - Query audit logs (filters: table, operation, userId, from, to, page, pageSize)
- `GET /api/admin/audits/{id}` - Get specific audit entry

## Security Best Practices

1. **Always use HTTPS** in production
2. **Store secrets in environment variables** or secure key management
3. **Rotate keys regularly** (quarterly recommended)
4. **Monitor audit logs** for suspicious activity
5. **Set appropriate rate limits** based on your traffic patterns
6. **Review failed login attempts** regularly
7. **Keep dependencies updated** for security patches

## Testing

Unit tests are provided in:
- `tests/GroceryStoreManagement.Tests/Services/AuthServiceTests.cs`
- `tests/GroceryStoreManagement.Tests/Services/AuditServiceTests.cs`

Run tests with:
```bash
dotnet test
```

## Troubleshooting

### Account Locked
- Use Admin API to unlock: `POST /api/users/{id}/unlock` (Admin only)
- Or wait for lockout duration to expire

### Token Refresh Fails
- Check if refresh token is expired or revoked
- User may need to re-login

### Encryption Errors
- Verify encryption key is correctly configured
- Ensure key is 256 bits (32 bytes) when base64 decoded

## Additional Notes

- All sensitive operations are logged to audit trail
- Passwords are never logged (masked in audit)
- Refresh tokens are stored hashed (HMAC-SHA256)
- Rate limiting uses in-memory storage (resets on app restart)
- For production, consider using Redis for distributed rate limiting

