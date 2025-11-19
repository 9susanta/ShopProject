# Grocery Store ERP + POS System - Project Flow & User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Login & Authentication](#login--authentication)
3. [System Flows](#system-flows)
4. [User Guide](#user-guide)
5. [Quick Reference](#quick-reference)

---

## Getting Started

### System Requirements

- **Browser**: Chrome, Firefox, Edge (latest versions)
- **Internet Connection**: Required (offline mode available for POS)
- **Screen Resolution**: Minimum 1024x768 (recommended 1920x1080)

### First Time Access

1. Open your browser and navigate to the application URL
2. You will be redirected to the login page
3. Enter your credentials (see Login Credentials section)
4. Click "Login"

### Login Credentials

**Test Accounts** (automatically created on database seed):

| Role | Email | Password |
|------|-------|----------|
| SuperAdmin | `superadmin@test.com` | `SuperAdmin123!` |
| Admin | `admin@test.com` | `Admin123!` |
| Staff | `staff@test.com` | `Staff123!` |

**Note**: All passwords end with exclamation mark (!) and are case-sensitive.

---

## Login & Authentication

### Login Process

1. Navigate to `/login` (automatic redirect if not logged in)
2. Enter email and password
3. Click "Login" button
4. Redirected to dashboard after successful login

### User Roles

- **SuperAdmin**: Full system access, user management
- **Admin**: Full operational access (sales, inventory, reports)
- **Staff**: Limited access (POS, view-only reports)

### Logout

- Click profile icon in top-right corner
- Select "Logout"
- Redirected to login page

---

## System Flows

### 1. Product Setup Flow

```
1. Create Categories
   └─> Settings → Master Data → Categories → New Category
   
2. Create Units
   └─> Settings → Master Data → Units → New Unit
   
3. Create Tax Slabs
   └─> Settings → Master Data → Tax Slabs → New Tax Slab
   
4. Create Products
   └─> Products → New Product
       ├─> Select Category
       ├─> Select Unit
       ├─> Select Tax Slab
       └─> Enter pricing and stock info
   
   OR
   
   Bulk Import
   └─> Imports → Upload Excel/JSON → Map Columns → Import
```

### 2. Purchasing Flow

```
1. Create Purchase Order
   └─> Purchasing → Purchase Orders → New PO
       ├─> Select Supplier
       ├─> Add Products with Quantities
       └─> Approve PO
   
2. Receive Goods (GRN)
   └─> Purchasing → GRN → New GRN
       ├─> Link to PO (optional)
       ├─> Select Supplier
       ├─> Add Received Items
       ├─> Enter Batch Info (if applicable)
       └─> Confirm GRN
           └─> Inventory Automatically Updated
   
3. Record Supplier Payment
   └─> Suppliers → Payments → Record Payment
       ├─> Select Supplier
       ├─> Enter Amount
       └─> Select Payment Method
```

### 3. Sales Flow (POS)

```
1. Access POS
   └─> Navigate to /pos (no login required)
   
2. Add Products to Cart
   ├─> Click product tiles
   ├─> Scan barcode
   ├─> Use voice command
   └─> Use weight scale (for weight-based products)
   
3. Select Customer (Optional)
   └─> Click "Select Customer" → Search by phone/name
       └─> View loyalty points and saved items
   
4. Apply Discounts (Optional)
   ├─> Enter coupon code
   └─> Apply manual discount
   
5. Checkout
   ├─> Select Payment Method
   │   ├─> Cash (enter cash received)
   │   ├─> UPI
   │   ├─> Card
   │   ├─> Pay Later (for credit customers)
   │   └─> Split Payment (multiple methods)
   ├─> Redeem Loyalty Points (if customer selected)
   └─> Complete Sale
       └─> Print Receipt (optional)
```

### 4. Inventory Management Flow

```
1. View Inventory
   └─> Inventory → Products
       └─> See stock levels and batches
   
2. Low Stock Alert
   └─> Inventory → Low Stock
       └─> Create Purchase Order from suggestions
   
3. Expiry Management
   └─> Inventory → Expiry
       ├─> View expiring batches
       ├─> Move to front (FIFO)
       └─> Mark as damaged/expired
   
4. Stock Adjustment
   └─> Inventory → Adjust
       ├─> Select Product
       ├─> Enter Quantity Change
       ├─> Select Adjustment Type
       └─> Save
```

### 5. Return Flow

```
1. Customer Return
   └─> Sales → Select Sale → Create Return
       ├─> Select Items to Return
       ├─> Enter Return Quantities
       └─> Create Return
           └─> Process Refund
               └─> Inventory Automatically Restored
   
2. Supplier Return
   └─> Purchasing → Supplier Returns → New Return
       ├─> Select Supplier
       ├─> Link to GRN (optional)
       ├─> Add Return Items
       └─> Save
           └─> Inventory Automatically Reduced
```

### 6. Reporting Flow

```
1. Access Reports
   └─> Reports → Select Report Type
   
2. Set Filters
   ├─> Date Range
   ├─> Product/Category Filters
   └─> Other Filters (as applicable)
   
3. Generate Report
   └─> Click "Load Report"
       └─> View Results
           └─> Export to Excel/PDF (optional)
```

---

## User Guide

### Dashboard Overview

**Access**: `/admin/dashboard`

**Features**:
- **Sales Overview**: Today's sales amount, count, revenue trends
- **Inventory Summary**: Low stock alerts, expiring products, total value
- **Fast-Moving Products**: Top-selling products table
- **Recent Activity**: Latest sales, imports, notifications

### Product Management

#### Viewing Products
- Navigate to **Products** (`/admin/products`)
- Use filters: Search, Category, Status
- Click product to view details

#### Creating a Product
1. Go to **Products** → Click **"New Product"**
2. Fill form:
   - Name, SKU, Barcode
   - Category, Unit, Tax Slab
   - MRP, Sale Price
   - Low Stock Threshold, Reorder Point
   - Description, Image (optional)
3. Click **"Save"**

#### Bulk Import
1. Navigate to **Imports** (`/admin/imports`)
2. Upload Excel/JSON file
3. Map columns to system fields
4. Start import and monitor progress

### Inventory Management

#### Inventory Dashboard
- View summary: Total products, Low stock, Expiring batches, Inventory value
- Quick access to key inventory functions

#### Low Stock Management
1. Go to **Inventory** → **Low Stock**
2. View products below threshold
3. Create purchase orders from suggestions

#### Expiry Management
1. Go to **Inventory** → **Expiry**
2. View batches expiring soon (default: 7 days)
3. Actions: Move to front, Create offers, Mark as damaged

#### Stock Adjustment
1. Go to **Inventory** → **Adjust**
2. Select product
3. Enter adjustment:
   - Type: Manual, Damage, Return, Expiry
   - Quantity Change: Positive (increase) or negative (decrease)
   - Reason and Reference Number
4. Click **"Save"**

### Purchasing Operations

#### Creating Purchase Order
1. Navigate to **Purchasing** → **Purchase Orders**
2. Click **"New Purchase Order"**
3. Fill in:
   - Supplier
   - Expected Delivery Date (optional)
   - Items (product, quantity, unit price)
4. Click **"Save"** (creates as Draft)
5. Click **"Approve"** to approve PO

#### Receiving Goods (GRN)
1. Go to **Purchasing** → **GRN**
2. Click **"New GRN"**
3. Select:
   - Supplier
   - Purchase Order (optional)
   - Received Date
4. Add items:
   - Product
   - Received quantity
   - Unit cost
   - Expiry date (if applicable)
   - Batch number (optional)
5. Upload invoice (optional)
6. Click **"Save"** (creates as Draft)
7. Click **"Confirm"** to confirm GRN
   - **Inventory automatically updated**

#### Supplier Payments
1. Go to **Suppliers** → **Payments**
2. Record Payment:
   - Select supplier
   - Enter amount
   - Select payment method
   - Link to PO/GRN (optional)
   - Add notes (optional)
3. View Outstanding Payments
4. View Payment History

### Point of Sale (POS)

**Access**: `/pos` (no login required)

#### POS Interface
- **Left**: Product Categories (click to filter)
- **Center**: Product Grid (tiles with name, price, stock)
- **Right**: Cart (items, quantities, totals)

#### Making a Sale

**Step 1: Add Products**
- Click product tile
- Scan barcode
- Use voice command: "Add [product] [qty]"
- Use weight scale (for weight-based products)

**Step 2: Adjust Quantities**
- Click **+** or **-** in cart
- Or enter quantity directly

**Step 3: Select Customer (Optional)**
- Click **"Select Customer"**
- Search by phone/name
- View loyalty points and saved items

**Step 4: Apply Discounts (Optional)**
- Enter coupon code
- Or apply manual discount

**Step 5: Checkout**
1. Review cart
2. Click **"Checkout"**
3. Select payment method:
   - Cash (enter cash received)
   - UPI
   - Card
   - Pay Later
   - Split Payment
4. Redeem loyalty points (if customer selected)
5. Click **"Complete Sale"**
6. Print receipt (optional)

#### POS Features
- **Offline Mode**: Works without internet, syncs when online
- **Keyboard Shortcuts**: F1 (search), F2 (cart), F3 (checkout), Esc (cancel)
- **Voice Commands**: "Add [product] [qty]", "Remove [product]", "Checkout"
- **Weight Scale Integration**: Automatic weight reading
- **Barcode Scanning**: Camera or scanner support

### Sales Management

#### Viewing Sales
1. Navigate to **Sales** (`/admin/sales`)
2. View list with filters:
   - Date range
   - Customer
   - Payment method
   - Status
3. Click sale to view details

#### Processing Returns
1. Go to **Sales** → Click on sale
2. Click **"Create Return"**
3. Select items and quantities
4. Enter return reason
5. Click **"Create Return"**
6. Process Refund:
   - Go to return details
   - Click **"Process Refund"**
   - Select refund method
   - Enter amount
   - Click **"Process"**

### Customer Management

#### Creating Customer
1. Go to **Customers** → Click **"New Customer"**
2. Fill form:
   - Name, Phone (required)
   - Email, Address (optional)
   - Pay Later Settings (enable/disable, credit limit)
3. Click **"Save"**

#### Customer Details
- **Overview**: Basic information
- **Purchase History**: All past purchases
- **Pay Later Ledger**: Credit transactions
- **Saved Items**: Frequently purchased items
- **Loyalty Points**: Points history

#### Pay Later Management
1. Go to customer details → **Pay Later Ledger**
2. View outstanding balance and transactions
3. Record Payment:
   - Enter amount
   - Select payment method
   - Enter reference number
   - Click **"Save"**

### Reports & Analytics

#### Daily Sales Report
- Select date (default: today)
- View: Total sales, Revenue, Tax, Discounts, Payment breakdown

#### GST Reports
- **GST Summary**: View GST breakdown by tax slab
- **GST Export**: Export GSTR-1 (Sales) or GSTR-2 (Purchases) to Excel

#### Product Reports
- **Fast-Moving**: Top-selling products
- **Slow-Moving**: Products with low sales
- **Item-wise Sales**: Sales by product

#### Inventory Reports
- **Low Stock**: Products below threshold
- **Expiry**: Batches expiring soon
- **Reorder Suggestions**: Products needing reorder

### Settings & Configuration

#### Store Settings
1. Navigate to **Settings** (`/admin/settings`)
2. Configure:
   - Store Name, GSTIN, Address
   - Contact Information
   - Packing Charges
   - Home Delivery Settings
   - Loyalty Points Rate
3. Click **"Save"**

#### User Management
1. Go to **Settings** → **Roles**
2. View roles: SuperAdmin, Admin, Staff
3. Manage users: Create, Assign roles, Activate/Deactivate

#### Permission Management
1. Go to **Settings** → **Permissions**
2. Select role from dropdown
3. Check/uncheck permissions
4. Permissions automatically saved

---

## Quick Reference

### Common Tasks

| Task | Route | Steps |
|------|-------|-------|
| Create Sale | `/pos` | Add products → Checkout → Select payment → Complete |
| View Sales | `/admin/sales` | Click on sale to view details |
| Create Product | `/admin/products/new` | Fill form → Save |
| Check Inventory | `/admin/inventory` | View dashboard or product list |
| Create PO | `/admin/purchasing/purchase-orders/new` | Select supplier → Add items → Save |
| Create GRN | `/admin/purchasing/grn/new` | Select supplier → Add items → Confirm |
| View Reports | `/admin/reports` | Select report type → Set filters → View |
| Adjust Stock | `/admin/inventory/adjust` | Select product → Enter adjustment → Save |

### Important URLs

- Login: `/login`
- Dashboard: `/admin/dashboard`
- POS: `/pos`
- Products: `/admin/products`
- Inventory: `/admin/inventory`
- Sales: `/admin/sales`
- Reports: `/admin/reports`
- Settings: `/admin/settings`

### Keyboard Shortcuts

**POS**:
- `F1`: Focus search
- `F2`: Open cart
- `F3`: Checkout
- `Esc`: Cancel/Close
- `Enter`: Confirm/Submit

**General**:
- `Ctrl + S`: Save (in forms)
- `Ctrl + F`: Search
- `Esc`: Close dialogs

---

## Troubleshooting

### Common Issues

#### Cannot Login
- Check if account is active
- Verify email/username is correct
- Clear browser cache and cookies
- Try different browser

#### Products Not Showing in POS
- Check if products are marked as "Active"
- Verify category filters
- Check if products have stock
- Refresh the page

#### Stock Not Updating
- Ensure GRN is "Confirmed" (not Draft)
- Check if GRN items have quantities
- Verify product exists
- Check inventory adjustment history

#### Receipt Not Printing
- Check printer connection (serial port)
- Verify printer is powered on
- Check printer settings
- Try manual print from sale details

#### Weight Scale Not Working
- Check scale connection (serial port)
- Verify scale is powered on
- Check scale settings
- Try manual weight entry

#### Offline Mode Not Working
- Check browser supports IndexedDB
- Verify offline storage is enabled
- Check browser storage quota
- Clear old offline data

#### Import Failing
- Check file format (Excel/JSON)
- Verify column mapping
- Check required fields are present
- Review error report

#### Reports Not Loading
- Check date range is valid
- Verify you have permission to view reports
- Try different date range
- Clear browser cache

---

## Best Practices

### Daily Operations

**Start of Day**:
- Check dashboard for alerts
- Review low stock items
- Check expiring batches
- Verify POS is working

**During Day**:
- Process sales through POS
- Monitor inventory levels
- Handle customer returns promptly
- Record supplier payments

**End of Day**:
- Review daily sales report
- Check daily closing summary
- Verify all transactions
- Print/export reports

### Inventory Management
- Set reorder points for all products
- Review reorder suggestions daily
- Check expiry reports weekly
- Adjust stock immediately when discrepancies found
- Keep batch information accurate

### Sales Management
- Always select customer when possible (for loyalty)
- Apply discounts correctly
- Process returns within return policy
- Print receipts for all sales
- Verify payment methods match actual payment

### Data Entry
- Enter accurate product information
- Use consistent naming conventions
- Keep barcodes updated
- Maintain supplier contact information
- Update customer details regularly

---

## Conclusion

This system provides comprehensive grocery store management capabilities. Follow this guide for day-to-day operations. For advanced features or issues, contact your system administrator.

**Remember**: 
- Always save your work
- Verify data before confirming
- Keep backups of important reports
- Report issues immediately
- Follow your store's policies and procedures

Happy managing! 🛒

