# Fix Password Iteration Issue

## Problem
We reduced PBKDF2 iterations from 100,000 to 10,000 for better performance. However, existing passwords in the database may have been created with 100k iterations, causing login failures.

## Solution

### Option 1: Reset and Re-seed Database (Recommended)

Call the reset-seed endpoint to update all passwords:

```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5120/api/test/reset-seed" `
    -Method POST `
    -ContentType "application/json"
```

Or using curl:
```bash
curl -X POST http://localhost:5120/api/test/reset-seed \
  -H "Content-Type: application/json"
```

This will:
1. Clean the database (preserve users)
2. Re-seed with updated passwords using 10k iterations
3. Update all test user passwords

### Option 2: Restart API

The seed data automatically updates passwords when the API starts:

1. Stop the API (Ctrl+C)
2. Start the API again:
   ```powershell
   cd src/API/GroceryStoreManagement.API
   dotnet run
   ```

The seed data will detect existing users and update their passwords with the new 10k iterations.

### Option 3: Manual Password Update

If you need to update a specific user's password:

1. Login as SuperAdmin (if possible)
2. Use the change-password endpoint:
   ```
   POST /api/users/{id}/change-password
   {
     "currentPassword": "OldPassword123!",
     "newPassword": "NewPassword123!"
   }
   ```

## Verification

After fixing, test login with:
- **Email:** `admin@test.com`
- **Password:** `Admin123!`

## How It Works

The seed data (`SeedData.cs`) has logic to update existing users:

```csharp
else if (context.Users.Any() && serviceProvider != null)
{
    // Update existing users to test passwords if they exist
    var passwordHasher = serviceProvider.GetRequiredService<IPasswordHasher>();
    
    var admin = await context.Users.FirstOrDefaultAsync(...);
    if (admin != null)
    {
        var adminResult = passwordHasher.HashPassword("Admin123!");
        admin.ChangePassword(adminResult.Hash);
        admin.SetPasswordMetadata(adminResult.Algorithm, adminResult.Salt, adminResult.Iterations);
    }
    // ... similar for other users
}
```

This runs automatically when:
- API starts (via `SeedDatabaseAsync()`)
- Or when you call `/api/test/reset-seed`

## Important Notes

1. **Password verification uses stored iterations**: The system uses `user.PasswordIterations` from the database, so old 100k passwords should still verify correctly.

2. **But new passwords use 10k**: When passwords are updated/rehashed, they use the new 10k iterations.

3. **Auto-rehash on login**: The login process automatically rehashes passwords with >20k iterations to 10k iterations for future logins.

4. **Seed data updates on API start**: The seed data checks for existing users and updates their passwords when the API starts.

## Quick Fix Command

```powershell
# Make sure API is running, then:
Invoke-RestMethod -Uri "http://localhost:5120/api/test/reset-seed" -Method POST
```

This will update all passwords to use 10k iterations.


