# E2E Testing Guide

## Overview

This directory contains end-to-end (E2E) tests for the Grocery Store ERP + POS System using Cypress.

## Test Structure

```
cypress/
├── e2e/
│   ├── 01-authentication.cy.ts          # Authentication tests
│   ├── 02-product-management.cy.ts     # Product CRUD tests
│   ├── 03-inventory-management.cy.ts    # Inventory tests
│   ├── 04-purchasing-workflow.cy.ts     # PO → GRN → Inventory flow
│   ├── 05-pos-operations.cy.ts          # POS functionality
│   ├── 06-sales-management.cy.ts        # Sales & returns
│   ├── 07-customer-supplier-management.cy.ts  # Customer/Supplier CRUD
│   ├── 08-reports.cy.ts                 # Reports & analytics
│   ├── 09-settings.cy.ts                # Settings & configuration
│   └── 10-offline-functionality.cy.ts   # Offline POS tests
├── support/
│   ├── commands.ts                      # Custom Cypress commands
│   └── e2e.ts                           # Support file
└── fixtures/                            # Test data fixtures (optional)
```

## Prerequisites

1. **Backend API** running on `http://localhost:5000`
2. **Frontend** running on `http://localhost:4200`
3. **Test Database** with seed data
4. **Test Users**:
   - Admin: `admin@test.com` / `Admin123!`
   - Staff: `staff@test.com` / `Staff123!`

## Running Tests

### Run All Tests

```bash
npm run e2e
```

### Open Cypress Test Runner (Interactive)

```bash
npm run e2e:open
```

### Run Specific Test File

```bash
npx cypress run --spec "cypress/e2e/01-authentication.cy.ts"
```

### Run Tests in Headed Mode

```bash
npx cypress run --headed
```

### Run Tests with Browser

```bash
npx cypress run --browser chrome
npx cypress run --browser firefox
npx cypress run --browser edge
```

## Test Data Setup

Before running tests, ensure the following test data exists:

### Categories
- At least 3 categories (e.g., "Groceries", "Beverages", "Snacks")

### Products
- At least 10 products with:
  - Various categories
  - Different units (kg, liter, piece)
  - Tax slabs assigned
  - Stock quantities

### Suppliers
- At least 2 suppliers with complete information

### Customers
- At least 2 customers with:
  - Phone numbers
  - Some with pay-later enabled
  - Some with loyalty points

### Tax Slabs
- 5%, 12%, 18% GST rates

### Units
- kg, liter, piece, gram, ml

## Configuration

### Cypress Configuration

Edit `cypress.config.ts` to modify:
- `baseUrl`: Frontend URL (default: `http://localhost:4200`)
- `apiUrl`: Backend API URL (default: `http://localhost:5000/api`)
- Timeouts
- Viewport size

### Environment Variables

Set in `cypress.config.ts` or via command line:

```bash
CYPRESS_apiUrl=http://localhost:5000/api npm run e2e
```

## Custom Commands

### `cy.loginUI(email, password)`
Login via UI (navigates to login page and fills form)

```typescript
cy.loginUI('admin@test.com', 'Admin123!');
```

### `cy.loginAPI(email, password)`
Login via API (faster, for setup)

```typescript
cy.loginAPI('admin@test.com', 'Admin123!');
```

### `cy.createPurchaseOrder(poData)`
Create purchase order via API

```typescript
cy.createPurchaseOrder({
  supplierId: '...',
  items: [...]
});
```

### `cy.createGRN(grnData)`
Create GRN via API

```typescript
cy.createGRN({
  supplierId: '...',
  items: [...]
});
```

### `cy.confirmGRN(grnId)`
Confirm GRN via API

```typescript
cy.confirmGRN('grn-id-here');
```

### `cy.waitForElement(selector, timeout)`
Wait for element with custom timeout

```typescript
cy.waitForElement('.product-list', 15000);
```

## Test Execution Strategy

### 1. Smoke Tests (Critical Path)
Run these first to verify basic functionality:
- `01-authentication.cy.ts`
- `05-pos-operations.cy.ts` (TC-POS-001)

### 2. Core Functionality
- `02-product-management.cy.ts`
- `04-purchasing-workflow.cy.ts`
- `06-sales-management.cy.ts`

### 3. Extended Functionality
- `03-inventory-management.cy.ts`
- `07-customer-supplier-management.cy.ts`
- `08-reports.cy.ts`

### 4. Configuration & Edge Cases
- `09-settings.cy.ts`
- `10-offline-functionality.cy.ts`

## Debugging Tests

### View Test Execution

1. Open Cypress Test Runner: `npm run e2e:open`
2. Select test file
3. Watch test execution in real-time
4. Use browser DevTools for debugging

### Screenshots & Videos

- Screenshots on failure: Automatically saved to `cypress/screenshots/`
- Videos: Disabled by default (set `video: true` in config)

### Console Logs

Add `cy.log()` for debugging:

```typescript
cy.log('Current URL:', cy.url());
cy.log('Element count:', cy.get('.items').length);
```

### Pause Test Execution

```typescript
cy.pause(); // Pauses test, allows manual interaction
```

## Common Issues & Solutions

### Issue: Tests fail with "Element not found"

**Solution**: Increase timeout or wait for element:
```typescript
cy.get('.element', { timeout: 15000 }).should('be.visible');
```

### Issue: Tests fail with "Network error"

**Solution**: 
- Verify backend API is running
- Check API URL in `cypress.config.ts`
- Verify CORS settings

### Issue: Tests fail with "Authentication error"

**Solution**:
- Verify test user credentials
- Check token expiration
- Use `cy.loginAPI()` for faster setup

### Issue: Tests are flaky (sometimes pass, sometimes fail)

**Solution**:
- Add explicit waits
- Use `cy.wait()` for API calls
- Check for race conditions
- Increase timeouts

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data after tests
3. **Selectors**: Use data-cy attributes when possible
4. **Assertions**: Always verify expected outcomes
5. **Timeouts**: Set appropriate timeouts for slow operations
6. **Retries**: Use `cy.get()` with retry logic
7. **Error Handling**: Handle expected errors gracefully

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run e2e
```

## Test Coverage

Current test coverage includes:
- ✅ Authentication & Authorization
- ✅ Product Management
- ✅ Inventory Management
- ✅ Purchasing Workflow
- ✅ Point of Sale
- ✅ Sales Management
- ✅ Customer Management
- ✅ Supplier Management
- ✅ Reports & Analytics
- ✅ Settings
- ✅ Offline Functionality

## Maintenance

- Update tests when features change
- Add tests for new features
- Review and update test data regularly
- Keep selectors up-to-date with UI changes
- Document new custom commands

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [E2E Test Cases Document](../E2E_TEST_CASES.md)

