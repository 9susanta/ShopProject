# E2E Testing Setup & Execution Guide

## Summary

I've successfully:
1. ✅ Created comprehensive E2E test cases (50+ tests across 10 test files)
2. ✅ Updated seed data to create test users with known credentials
3. ✅ Added database cleanup functionality
4. ✅ Added SuperAdmin role tests
5. ✅ Fixed build errors
6. ✅ Updated environment configuration

## Test Users Created

The following test users are automatically created/updated in the database:

- **SuperAdmin**: `superadmin@test.com` / `SuperAdmin123!`
- **Admin**: `admin@test.com` / `Admin123!`
- **Staff**: `staff@test.com` / `Staff123!`

## Database Cleanup

A test controller has been added at `/api/test` with endpoints:
- `POST /api/test/clean-database` - Cleans all data except users
- `POST /api/test/reset-seed` - Cleans database and re-seeds

## Running the Tests

### Step 1: Start the Backend API

```powershell
cd D:\Projects\ShopProject\src\API\GroceryStoreManagement.API
dotnet run --urls "http://localhost:5000"
```

Wait for the API to start (you'll see "Now listening on: http://localhost:5000")

### Step 2: Start the Frontend

Open a **new terminal**:

```powershell
cd D:\Projects\ShopProject\frontend
npm start
```

Wait for the frontend to compile and start (usually takes 30-60 seconds)

### Step 3: Reset Database (Optional)

Before running tests, you can reset the database:

```powershell
curl -X POST http://localhost:5000/api/test/reset-seed
```

Or use Postman/Thunder Client to call:
- URL: `http://localhost:5000/api/test/reset-seed`
- Method: POST

### Step 4: Run E2E Tests

Open a **new terminal**:

```powershell
cd D:\Projects\ShopProject\frontend
npm run e2e
```

Or run specific test file:

```powershell
npx cypress run --spec "cypress/e2e/01-authentication.cy.ts"
```

### Step 5: Open Cypress Test Runner (Interactive Mode)

For interactive debugging:

```powershell
cd D:\Projects\ShopProject\frontend
npm run e2e:open
```

## Test Files Created

1. **01-authentication.cy.ts** - Login, logout, role-based access (includes SuperAdmin)
2. **02-product-management.cy.ts** - Product CRUD operations
3. **03-inventory-management.cy.ts** - Inventory dashboard, adjustments, expiry
4. **04-purchasing-workflow.cy.ts** - PO → GRN → Inventory flow
5. **05-pos-operations.cy.ts** - Complete POS sale flow
6. **06-sales-management.cy.ts** - Sales list, returns, refunds
7. **07-customer-supplier-management.cy.ts** - Customer/Supplier CRUD
8. **08-reports.cy.ts** - All report types
9. **09-settings.cy.ts** - Store settings, permissions
10. **10-offline-functionality.cy.ts** - Offline POS functionality

## Test Coverage

- ✅ Authentication (Admin, Staff, SuperAdmin)
- ✅ Product Management
- ✅ Inventory Management
- ✅ Purchasing Workflow
- ✅ Point of Sale
- ✅ Sales Management
- ✅ Customer Management
- ✅ Supplier Management
- ✅ Reports & Analytics
- ✅ Settings & Configuration
- ✅ Offline Functionality

## SuperAdmin Tests Added

- `TC-AUTH-001-SUPER`: SuperAdmin login test
- `TC-AUTH-003`: SuperAdmin role-based access test (can access all routes)

## Configuration Updates

1. **Environment**: Updated `frontend/src/environments/environment.ts` to use port 5000
2. **Seed Data**: Updated to create test users with known passwords
3. **Cypress Config**: Enhanced with timeouts and API URL configuration

## Troubleshooting

### Issue: Frontend not starting
- Check if port 4200 is already in use
- Kill any existing Angular processes
- Try: `npm start` again

### Issue: API not starting
- Check if port 5000 is already in use
- Check database connection string in `appsettings.json`
- Ensure SQL Server LocalDB is running

### Issue: Tests failing with connection errors
- Ensure both API and Frontend are running
- Check API is accessible at `http://localhost:5000`
- Check Frontend is accessible at `http://localhost:4200`

### Issue: Database errors
- Run migrations: `dotnet ef database update`
- Reset database: `POST /api/test/reset-seed`

## Next Steps

1. Start both services (API and Frontend)
2. Run the E2E tests
3. Review test results
4. Fix any failing tests based on actual UI structure
5. Add more tests as needed

## Notes

- Tests use flexible selectors to work with Angular Material UI
- Some tests may need adjustment based on actual UI implementation
- Database cleanup preserves user data only
- Test data is automatically seeded when database is reset

