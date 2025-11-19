# Login Credentials

## Test User Accounts

These credentials are automatically created when the database is seeded.

### 1. SuperAdmin Account
**Full system access - can manage everything including users**

- **Email:** `superadmin@test.com`
- **Password:** `SuperAdmin123!`
- **Role:** SuperAdmin
- **Access:** 
  - All features
  - User management (create, edit, delete users)
  - System settings
  - All reports and analytics

### 2. Admin Account
**Management access - recommended for testing**

- **Email:** `admin@test.com`
- **Password:** `Admin123!`
- **Role:** Admin
- **Access:**
  - Most features
  - Inventory management
  - Purchasing
  - Sales management
  - Reports
  - Cannot create SuperAdmin/Admin users

### 3. Staff Account
**Limited access - for POS operations**

- **Email:** `staff@test.com`
- **Password:** `Staff123!`
- **Role:** Staff
- **Access:**
  - POS operations
  - Sales transactions
  - Basic inventory viewing
  - Customer management
  - Limited reports

## Quick Reference

| Role | Email | Password |
|------|-------|----------|
| SuperAdmin | `superadmin@test.com` | `SuperAdmin123!` |
| Admin | `admin@test.com` | `Admin123!` |
| Staff | `staff@test.com` | `Staff123!` |

## Important Notes

1. **All passwords end with exclamation mark (!)**
2. **Passwords are case-sensitive**
3. **These are test credentials - change in production**
4. **If account is locked, wait 15 minutes or use unlock endpoint**

## Account Lockout

If you enter wrong password 5 times:
- Account locks for 15 minutes
- Auto-unlocks after duration expires
- Admin can unlock via API: `POST /api/users/{id}/unlock`

## Reset Credentials

If credentials don't work:
1. Check if database is seeded
2. Reset database: `POST /api/test/reset-seed` (if available)
3. Or manually update password via API

## Login URL

- **Frontend:** http://localhost:4200/login
- **API:** http://localhost:5120/api/auth/login


