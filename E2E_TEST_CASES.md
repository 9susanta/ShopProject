# End-to-End Test Cases

Complete E2E test coverage for Grocery Store ERP + POS System.

---

## Test Categories

### 1. Authentication & Authorization
### 2. Master Data Management
### 3. Product Management
### 4. Inventory Management
### 5. Purchasing Workflow
### 6. Point of Sale (POS)
### 7. Sales Management
### 8. Customer Management
### 9. Supplier Management
### 10. Reports & Analytics
### 11. Settings & Configuration
### 12. Hardware Integration
### 13. Offline Functionality

---

## Test Cases

### Category 1: Authentication & Authorization

#### TC-AUTH-001: User Login
**Priority**: Critical  
**Description**: Verify user can login with valid credentials

**Steps**:
1. Navigate to `/login`
2. Enter valid email and password
3. Click "Login" button
4. Verify redirect to `/admin/dashboard`
5. Verify user name displayed in header

**Expected Result**: User successfully logged in and redirected to dashboard

---

#### TC-AUTH-002: Invalid Login
**Priority**: High  
**Description**: Verify login fails with invalid credentials

**Steps**:
1. Navigate to `/login`
2. Enter invalid email or password
3. Click "Login" button
4. Verify error message displayed
5. Verify user remains on login page

**Expected Result**: Error message shown, user not logged in

---

#### TC-AUTH-003: Role-Based Access Control
**Priority**: Critical  
**Description**: Verify users can only access routes allowed by their role

**Steps**:
1. Login as Staff user
2. Attempt to access `/admin/settings`
3. Verify access denied or redirect
4. Login as Admin user
5. Access `/admin/settings`
6. Verify access granted

**Expected Result**: Staff cannot access admin routes, Admin can access

---

#### TC-AUTH-004: Session Timeout
**Priority**: Medium  
**Description**: Verify user is logged out after session timeout

**Steps**:
1. Login successfully
2. Wait for token expiration (or manually expire)
3. Attempt to access protected route
4. Verify redirect to login page

**Expected Result**: User logged out and redirected to login

---

#### TC-AUTH-005: Logout
**Priority**: High  
**Description**: Verify user can logout successfully

**Steps**:
1. Login successfully
2. Click profile icon
3. Click "Logout"
4. Verify redirect to login page
5. Verify cannot access protected routes

**Expected Result**: User logged out successfully

---

### Category 2: Master Data Management

#### TC-MASTER-001: Create Category
**Priority**: High  
**Description**: Verify admin can create a new category

**Steps**:
1. Login as Admin
2. Navigate to master data or products
3. Create new category
4. Enter category name and description
5. Save category
6. Verify category appears in list

**Expected Result**: Category created successfully

---

#### TC-MASTER-002: Create Unit
**Priority**: Medium  
**Description**: Verify admin can create measurement units

**Steps**:
1. Login as Admin
2. Navigate to units management
3. Create new unit (e.g., "Kilogram", "Liter")
4. Save unit
5. Verify unit available in product form

**Expected Result**: Unit created and available for use

---

#### TC-MASTER-003: Create Tax Slab
**Priority**: High  
**Description**: Verify admin can create GST tax slabs

**Steps**:
1. Login as Admin
2. Navigate to tax slabs
3. Create new tax slab
4. Enter rate (e.g., 5%, 12%, 18%)
5. Save tax slab
6. Verify tax slab available in product form

**Expected Result**: Tax slab created successfully

---

### Category 3: Product Management

#### TC-PROD-001: Create Product
**Priority**: Critical  
**Description**: Verify admin can create a new product

**Steps**:
1. Login as Admin
2. Navigate to `/admin/products`
3. Click "New Product"
4. Fill in form:
   - Name: "Test Product"
   - SKU: "TEST-001"
   - Category: Select category
   - Unit: Select unit
   - MRP: 100
   - Sale Price: 90
   - Tax Slab: Select tax slab
5. Save product
6. Verify product appears in list
7. Click on product to verify details

**Expected Result**: Product created with all details saved correctly

---

#### TC-PROD-002: Edit Product
**Priority**: High  
**Description**: Verify admin can edit existing product

**Steps**:
1. Login as Admin
2. Navigate to products list
3. Click on a product
4. Click "Edit"
5. Change sale price
6. Save changes
7. Verify changes reflected in product details

**Expected Result**: Product updated successfully

---

#### TC-PROD-003: Search Products
**Priority**: High  
**Description**: Verify product search functionality

**Steps**:
1. Navigate to products list
2. Enter search term in search box
3. Verify filtered results
4. Search by barcode
5. Verify correct product found

**Expected Result**: Search returns correct products

---

#### TC-PROD-004: Bulk Import Products
**Priority**: Medium  
**Description**: Verify bulk product import from Excel

**Steps**:
1. Login as Admin
2. Navigate to `/admin/imports`
3. Click "Upload File"
4. Select Excel file with products
5. Map columns
6. Start import
7. Monitor progress
8. Verify products imported
9. Check error report if any errors

**Expected Result**: Products imported successfully

---

#### TC-PROD-005: Set Reorder Point
**Priority**: Medium  
**Description**: Verify admin can set reorder points

**Steps**:
1. Navigate to inventory → product
2. Click "Edit Reorder Point"
3. Set reorder point: 50
4. Set suggested quantity: 100
5. Save
6. Verify reorder point saved

**Expected Result**: Reorder point set successfully

---

### Category 4: Inventory Management

#### TC-INV-001: View Inventory Dashboard
**Priority**: High  
**Description**: Verify inventory dashboard displays correctly

**Steps**:
1. Login as Admin
2. Navigate to `/admin/inventory`
3. Verify dashboard shows:
   - Total products
   - Low stock count
   - Expiring batches
   - Inventory value
4. Click on low stock alert
5. Verify low stock list displayed

**Expected Result**: Dashboard displays all metrics correctly

---

#### TC-INV-002: View Low Stock Products
**Priority**: High  
**Description**: Verify low stock products are listed

**Steps**:
1. Navigate to `/admin/inventory/low-stock`
2. Verify products below threshold listed
3. Check product details
4. Verify stock quantities displayed

**Expected Result**: Low stock products listed correctly

---

#### TC-INV-003: Stock Adjustment
**Priority**: Critical  
**Description**: Verify manual stock adjustment

**Steps**:
1. Navigate to `/admin/inventory/adjust`
2. Select product
3. Enter adjustment:
   - Type: Manual
   - Quantity: +10 (increase)
   - Reason: "Stock found"
4. Save adjustment
5. Verify inventory updated
6. Check adjustment history

**Expected Result**: Stock adjusted and inventory updated

---

#### TC-INV-004: View Expiring Batches
**Priority**: High  
**Description**: Verify expiring batches are listed

**Steps**:
1. Navigate to `/admin/inventory/expiry`
2. Set days threshold: 30
3. Verify batches expiring within 30 days listed
4. Check batch details
5. Verify expiry dates displayed

**Expected Result**: Expiring batches listed correctly

---

#### TC-INV-005: View Reorder Suggestions
**Priority**: Medium  
**Description**: Verify reorder suggestions work

**Steps**:
1. Navigate to `/admin/reports/reorder-suggestions`
2. Verify products below reorder point listed
3. Check suggested quantities
4. Toggle "Only below reorder point"
5. Verify filter works

**Expected Result**: Reorder suggestions displayed correctly

---

### Category 5: Purchasing Workflow

#### TC-PURCH-001: Create Purchase Order
**Priority**: Critical  
**Description**: Verify complete PO creation workflow

**Steps**:
1. Login as Admin
2. Navigate to `/admin/purchasing/purchase-orders`
3. Click "New Purchase Order"
4. Select supplier
5. Add items:
   - Product 1: Quantity 10, Price 50
   - Product 2: Quantity 5, Price 100
6. Review total
7. Save PO (Draft)
8. Verify PO created
9. Approve PO
10. Verify status changed to Approved

**Expected Result**: PO created and approved successfully

---

#### TC-PURCH-002: Create GRN from PO
**Priority**: Critical  
**Description**: Verify GRN creation from purchase order

**Steps**:
1. Navigate to approved PO
2. Click "Create GRN"
3. Verify PO items pre-filled
4. Enter received quantities
5. Enter unit costs
6. Enter expiry dates for items
7. Upload invoice (optional)
8. Save GRN (Draft)
9. Confirm GRN
10. Verify:
    - GRN status: Confirmed
    - Inventory updated
    - Batches created

**Expected Result**: GRN created and inventory updated

---

#### TC-PURCH-003: Create Ad-hoc GRN
**Priority**: High  
**Description**: Verify GRN creation without PO

**Steps**:
1. Navigate to `/admin/purchasing/grn/new`
2. Select supplier (no PO)
3. Add items manually
4. Enter received quantities and costs
5. Save and confirm GRN
6. Verify inventory updated

**Expected Result**: Ad-hoc GRN created successfully

---

#### TC-PURCH-004: Supplier Return
**Priority**: High  
**Description**: Verify supplier return process

**Steps**:
1. Navigate to `/admin/purchasing/supplier-returns/new`
2. Select supplier
3. Optionally select GRN
4. Add return items:
   - Product: Select product
   - Quantity: 2
   - Reason: "Defective"
5. Save return
6. Verify:
    - Return created
    - Inventory reduced
    - Return appears in list

**Expected Result**: Supplier return processed correctly

---

#### TC-PURCH-005: Record Supplier Payment
**Priority**: High  
**Description**: Verify supplier payment recording

**Steps**:
1. Navigate to `/admin/suppliers/payments`
2. Select supplier
3. Enter payment:
   - Amount: 5000
   - Method: UPI
   - Date: Today
   - Reference: "UPI-12345"
4. Link to GRN (optional)
5. Save payment
6. Verify:
    - Payment recorded
    - Outstanding amount updated
    - Payment in history

**Expected Result**: Payment recorded successfully

---

### Category 6: Point of Sale (POS)

#### TC-POS-001: Complete Sale Flow
**Priority**: Critical  
**Description**: Verify complete POS sale workflow

**Steps**:
1. Navigate to `/pos`
2. Search for product
3. Click product to add to cart
4. Add multiple products
5. Adjust quantities
6. Select customer (optional)
7. Click "Checkout"
8. Select payment method: Cash
9. Enter cash amount
10. Complete sale
11. Verify:
    - Sale created
    - Receipt displayed
    - Inventory reduced

**Expected Result**: Sale completed successfully

---

#### TC-POS-002: Barcode Scanning
**Priority**: High  
**Description**: Verify barcode scanning in POS

**Steps**:
1. Navigate to `/pos`
2. Click barcode scanner icon
3. Scan barcode (or enter manually)
4. Verify product added to cart
5. Scan multiple products
6. Verify all products in cart

**Expected Result**: Products added via barcode scanning

---

#### TC-POS-003: Customer Selection
**Priority**: High  
**Description**: Verify customer selection in POS

**Steps**:
1. Navigate to `/pos`
2. Add products to cart
3. Click "Select Customer"
4. Search customer by phone
5. Select customer
6. Verify:
    - Customer name displayed
    - Loyalty points shown
    - Pay-later balance shown
7. Complete sale
8. Verify loyalty points earned

**Expected Result**: Customer selected and loyalty points earned

---

#### TC-POS-004: Apply Discount/Coupon
**Priority**: High  
**Description**: Verify discount application

**Steps**:
1. Navigate to `/pos`
2. Add products to cart
3. Enter coupon code (if available)
4. Click "Apply"
5. Verify discount applied
6. Or apply manual discount
7. Verify total updated

**Expected Result**: Discount applied correctly

---

#### TC-POS-005: Split Payment
**Priority**: Medium  
**Description**: Verify split payment functionality

**Steps**:
1. Navigate to `/pos`
2. Add products (Total: ₹1000)
3. Checkout
4. Select split payment:
   - Cash: ₹500
   - UPI: ₹500
5. Complete sale
6. Verify sale recorded with split payment

**Expected Result**: Split payment processed correctly

---

#### TC-POS-006: Weight-Based Product
**Priority**: Medium  
**Description**: Verify weight scale integration

**Steps**:
1. Navigate to `/pos`
2. Add weight-based product (e.g., Rice in kg)
3. Verify weight prompt or scale reading
4. Enter weight manually if scale unavailable
5. Verify weight quantity in cart
6. Complete sale

**Expected Result**: Weight-based sale processed correctly

---

#### TC-POS-007: Offline Sale
**Priority**: High  
**Description**: Verify offline POS functionality

**Steps**:
1. Navigate to `/pos`
2. Disable network (or simulate offline)
3. Verify offline indicator shown
4. Add products to cart
5. Complete sale
6. Verify sale queued locally
7. Enable network
8. Verify sale synced automatically
9. Check sales list for synced sale

**Expected Result**: Offline sale queued and synced

---

### Category 7: Sales Management

#### TC-SALE-001: View Sales List
**Priority**: High  
**Description**: Verify sales list displays correctly

**Steps**:
1. Navigate to `/admin/sales`
2. Verify sales listed with:
   - Invoice number
   - Date
   - Customer
   - Amount
   - Payment method
3. Apply filters:
   - Date range
   - Customer
   - Payment method
4. Verify filtered results

**Expected Result**: Sales list displays and filters correctly

---

#### TC-SALE-002: View Sale Details
**Priority**: High  
**Description**: Verify sale details page

**Steps**:
1. Navigate to sales list
2. Click on a sale
3. Verify details shown:
   - Invoice number
   - Items
   - Totals
   - Payment breakdown
   - GST breakdown
4. Click "Print Receipt"
5. Verify receipt print initiated

**Expected Result**: Sale details displayed correctly

---

#### TC-SALE-003: Create Sale Return
**Priority**: Critical  
**Description**: Verify sale return process

**Steps**:
1. Navigate to sale details
2. Click "Create Return"
3. Select items to return:
   - Item 1: Quantity 1
   - Reason: "Defective"
4. Review return summary
5. Create return
6. Verify:
    - Return created
    - Inventory restored
    - Return status: Pending
7. Process refund
8. Verify refund processed

**Expected Result**: Return created and refund processed

---

#### TC-SALE-004: Process Refund
**Priority**: High  
**Description**: Verify refund processing

**Steps**:
1. Navigate to sale return
2. Click "Process Refund"
3. Select refund method: Cash
4. Enter refund amount
5. Process refund
6. Verify:
    - Refund status: Processed
    - Return status: Approved

**Expected Result**: Refund processed successfully

---

### Category 8: Customer Management

#### TC-CUST-001: Create Customer
**Priority**: High  
**Description**: Verify customer creation

**Steps**:
1. Navigate to `/admin/customers`
2. Click "New Customer"
3. Fill form:
   - Name: "Test Customer"
   - Phone: "9876543210"
   - Email: "test@example.com"
4. Save customer
5. Verify customer in list

**Expected Result**: Customer created successfully

---

#### TC-CUST-002: View Customer Details
**Priority**: High  
**Description**: Verify customer details page

**Steps**:
1. Navigate to customers list
2. Click on customer
3. Verify tabs:
   - Overview
   - Purchase History
   - Pay Later Ledger
   - Saved Items
4. Check purchase history
5. Check pay-later balance

**Expected Result**: Customer details displayed correctly

---

#### TC-CUST-003: Record Pay-Later Payment
**Priority**: High  
**Description**: Verify pay-later payment recording

**Steps**:
1. Navigate to customer details
2. Go to "Pay Later Ledger" tab
3. Click "Record Payment"
4. Enter:
   - Amount: 500
   - Method: Cash
   - Reference: "PAY-001"
5. Save payment
6. Verify:
    - Payment recorded
    - Outstanding balance updated
    - Payment in ledger

**Expected Result**: Pay-later payment recorded

---

### Category 9: Supplier Management

#### TC-SUPPL-001: Create Supplier
**Priority**: High  
**Description**: Verify supplier creation

**Steps**:
1. Navigate to `/admin/suppliers`
2. Click "New Supplier"
3. Fill form:
   - Name: "Test Supplier"
   - Contact: "John Doe"
   - Phone: "9876543210"
   - GSTIN: "29ABCDE1234F1Z5"
4. Save supplier
5. Verify supplier in list

**Expected Result**: Supplier created successfully

---

#### TC-SUPPL-002: View Outstanding Payments
**Priority**: High  
**Description**: Verify outstanding payments view

**Steps**:
1. Navigate to `/admin/suppliers/payments`
2. Go to "Outstanding Payments" tab
3. Verify suppliers with outstanding amounts listed
4. Check unpaid GRNs count
5. Click "View Payments" for supplier
6. Verify payment history

**Expected Result**: Outstanding payments displayed correctly

---

### Category 10: Reports & Analytics

#### TC-REPT-001: Daily Sales Report
**Priority**: High  
**Description**: Verify daily sales report

**Steps**:
1. Navigate to `/admin/reports/daily-sales`
2. Select date (default: today)
3. Click "Generate Report"
4. Verify report shows:
   - Total sales
   - Revenue
   - Tax
   - Discounts
   - Payment breakdown
5. Export report (if available)

**Expected Result**: Daily sales report generated correctly

---

#### TC-REPT-002: GST Summary Report
**Priority**: High  
**Description**: Verify GST summary report

**Steps**:
1. Navigate to `/admin/reports/gst-summary`
2. Select date range
3. Generate report
4. Verify:
   - Total GST
   - CGST/SGST breakdown
   - Tax slab summaries
5. Export if needed

**Expected Result**: GST report generated correctly

---

#### TC-REPT-003: GSTR-1 Export
**Priority**: Medium  
**Description**: Verify GSTR-1 export

**Steps**:
1. Navigate to `/admin/reports/gst-export`
2. Select date range
3. Click "Export GSTR-1"
4. Verify Excel file downloads
5. Open file and verify data

**Expected Result**: GSTR-1 Excel file downloaded with correct data

---

#### TC-REPT-004: Fast-Moving Products
**Priority**: Medium  
**Description**: Verify fast-moving products report

**Steps**:
1. Navigate to `/admin/reports/fast-moving`
2. Select date range
3. Set top N (e.g., 20)
4. Generate report
5. Verify top-selling products listed

**Expected Result**: Fast-moving products report generated

---

#### TC-REPT-005: Low Stock Report
**Priority**: High  
**Description**: Verify low stock report

**Steps**:
1. Navigate to `/admin/reports/low-stock`
2. Set threshold (optional)
3. Generate report
4. Verify products below threshold listed
5. Check reorder points

**Expected Result**: Low stock report generated correctly

---

#### TC-REPT-006: Expiry Report
**Priority**: High  
**Description**: Verify expiry report

**Steps**:
1. Navigate to `/admin/reports/expiry`
2. Set days threshold: 30
3. Generate report
4. Verify batches expiring within 30 days listed
5. Check expiry dates and quantities

**Expected Result**: Expiry report generated correctly

---

### Category 11: Settings & Configuration

#### TC-SETT-001: Update Store Settings
**Priority**: High  
**Description**: Verify store settings update

**Steps**:
1. Navigate to `/admin/settings`
2. Update settings:
   - Store name
   - GSTIN
   - Address
   - Loyalty points per ₹100
3. Save settings
4. Verify settings saved
5. Check settings reflected in invoices

**Expected Result**: Store settings updated successfully

---

#### TC-SETT-002: Permission Management
**Priority**: Medium  
**Description**: Verify permission assignment

**Steps**:
1. Navigate to `/admin/settings/permissions`
2. Select role: Staff
3. Check/uncheck permissions
4. Verify permissions saved
5. Login as user with that role
6. Verify access matches permissions

**Expected Result**: Permissions assigned correctly

---

### Category 12: Hardware Integration

#### TC-HW-001: Weight Scale Reading
**Priority**: Medium  
**Description**: Verify weight scale integration

**Steps**:
1. Ensure weight scale connected
2. Navigate to POS
3. Add weight-based product
4. Place item on scale
5. Verify weight read automatically
6. Verify weight in cart

**Expected Result**: Weight read from scale correctly

---

#### TC-HW-002: Receipt Printing
**Priority**: Medium  
**Description**: Verify thermal receipt printing

**Steps**:
1. Ensure printer connected
2. Complete a sale
3. Click "Print Receipt" in sale details
4. Verify print command sent
5. Check printer receives data

**Expected Result**: Receipt printed successfully

---

#### TC-HW-003: Barcode Printing
**Priority**: Low  
**Description**: Verify barcode printing

**Steps**:
1. Navigate to product details
2. Click "Print Barcode"
3. Enter quantity: 10
4. Print barcodes
5. Verify barcodes printed

**Expected Result**: Barcodes printed successfully

---

### Category 13: Offline Functionality

#### TC-OFF-001: Offline Indicator
**Priority**: High  
**Description**: Verify offline indicator displays

**Steps**:
1. Navigate to POS
2. Disable network
3. Verify offline indicator appears
4. Enable network
5. Verify indicator disappears

**Expected Result**: Offline indicator works correctly

---

#### TC-OFF-002: Offline Sale Queue
**Priority**: Critical  
**Description**: Verify offline sales are queued

**Steps**:
1. Navigate to POS
2. Disable network
3. Complete a sale
4. Verify sale queued locally
5. Enable network
6. Verify sale synced
7. Check sales list for synced sale

**Expected Result**: Offline sales queued and synced

---

## Test Execution Strategy

### Test Environment Setup

1. **Backend API**: Running on `http://localhost:5000`
2. **Frontend**: Running on `http://localhost:4200`
3. **Database**: Test database with seed data
4. **Test Users**:
   - Admin: `admin@test.com` / `Admin123!`
   - Staff: `staff@test.com` / `Staff123!`

### Test Data Requirements

- Categories: At least 3 categories
- Products: At least 10 products with various types
- Suppliers: At least 2 suppliers
- Customers: At least 2 customers
- Tax Slabs: 5%, 12%, 18%
- Units: kg, liter, piece

### Test Execution Order

1. Authentication tests (setup)
2. Master data tests (prerequisites)
3. Product management
4. Inventory management
5. Purchasing workflow
6. POS operations
7. Sales management
8. Customer/Supplier management
9. Reports
10. Settings
11. Hardware integration
12. Offline functionality

### Success Criteria

- All Critical tests must pass
- 90% of High priority tests must pass
- 80% of Medium priority tests must pass
- 70% of Low priority tests must pass

---

## Test Maintenance

- Update tests when features change
- Add tests for new features
- Review and update test data regularly
- Maintain test documentation

