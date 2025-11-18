# Grocery Store ERP + POS System - Complete User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Login & Authentication](#login--authentication)
3. [Dashboard Overview](#dashboard-overview)
4. [Product Management](#product-management)
5. [Inventory Management](#inventory-management)
6. [Purchasing Operations](#purchasing-operations)
7. [Point of Sale (POS)](#point-of-sale-pos)
8. [Sales Management](#sales-management)
9. [Customer Management](#customer-management)
10. [Supplier Management](#supplier-management)
11. [Reports & Analytics](#reports--analytics)
12. [Settings & Configuration](#settings--configuration)
13. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements

- **Browser**: Chrome, Firefox, Edge (latest versions)
- **Internet Connection**: Required (offline mode available for POS)
- **Screen Resolution**: Minimum 1024x768 (recommended 1920x1080)

### First Time Access

1. Open your browser and navigate to the application URL
2. You will be redirected to the login page
3. Enter your credentials provided by the system administrator
4. Click "Login"

---

## Login & Authentication

### Login Process

1. **Navigate to Login Page**
   - If not logged in, you'll be automatically redirected to `/login`

2. **Enter Credentials**
   - **Email/Username**: Your registered email address
   - **Password**: Your password
   - Click "Login" button

3. **Dashboard Access**
   - After successful login, you'll be redirected to the dashboard
   - Your session will remain active until you logout

### User Roles

- **SuperAdmin**: Full system access, user management
- **Admin**: Full operational access (sales, inventory, reports)
- **Staff**: Limited access (POS, view-only reports)

### Logout

- Click your profile icon in the top-right corner
- Select "Logout"
- You'll be redirected to the login page

---

## Dashboard Overview

### Accessing Dashboard

- URL: `/admin/dashboard`
- Automatically shown after login
- Accessible via sidebar menu

### Dashboard Features

1. **Sales Overview**
   - Today's sales amount
   - Sales count
   - Revenue trends (chart)

2. **Inventory Summary**
   - Low stock alerts
   - Expiring products
   - Total inventory value

3. **Fast-Moving Products**
   - Top-selling products table
   - Quick access to product details

4. **Recent Activity**
   - Latest sales
   - Recent imports
   - System notifications

### Navigation

- **Sidebar Menu**: Access all modules
- **Top Bar**: Search, notifications, profile
- **Breadcrumbs**: Shows current location

---

## Product Management

### Viewing Products

1. Navigate to **Products** from sidebar (`/admin/products`)
2. Use filters:
   - Search by name/SKU/barcode
   - Filter by category
   - Filter by status (Active/Inactive)
3. Click on a product to view details

### Creating a Product

1. Go to **Products** → Click **"New Product"** button
2. Fill in the form:
   - **Name**: Product name (required)
   - **SKU**: Unique stock keeping unit (required)
   - **Barcode**: Product barcode (optional)
   - **Category**: Select from dropdown
   - **Unit**: Select unit (kg, liter, piece, etc.)
   - **MRP**: Maximum Retail Price
   - **Sale Price**: Selling price (must be ≤ MRP)
   - **Tax Slab**: Select applicable GST rate
   - **Low Stock Threshold**: Alert when stock falls below this
   - **Reorder Point**: Minimum stock before reordering
   - **Suggested Reorder Quantity**: Recommended order quantity
   - **Description**: Product description (optional)
   - **Image**: Upload product image (optional)
3. Click **"Save"**

### Editing a Product

1. Go to **Products** → Click on product
2. Click **"Edit"** button
3. Modify fields as needed
4. Click **"Save"**

### Bulk Import Products

1. Navigate to **Imports** (`/admin/imports`)
2. Click **"Upload File"**
3. Select Excel (.xlsx) or JSON file
4. Map columns:
   - Match file columns to system fields
   - Select update options
5. Click **"Start Import"**
6. Monitor progress in real-time
7. Download error report if any errors occur

### Product Details

- View all product information
- See inventory levels
- View batch information
- Check purchase history
- View sales history

---

## Inventory Management

### Inventory Dashboard

1. Navigate to **Inventory** (`/admin/inventory`)
2. View summary:
   - Total products
   - Low stock items
   - Expiring batches
   - Inventory value

### Viewing Inventory

1. Go to **Inventory** → **Products**
2. See all products with:
   - Current stock
   - Available quantity
   - Reserved quantity
   - Batch information

### Low Stock Management

1. Go to **Inventory** → **Low Stock**
2. View products below threshold
3. Click on product to:
   - View details
   - Create purchase order
   - Adjust stock

### Expiry Management

1. Go to **Inventory** → **Expiry**
2. View batches expiring soon
3. Filter by days (default: 7 days)
4. Take action:
   - Move to front (FIFO)
   - Create discount offers
   - Mark as damaged

### Stock Adjustment

1. Go to **Inventory** → **Adjust**
2. Select product
3. Enter adjustment:
   - **Type**: Manual, Damage, Return, Expiry
   - **Quantity Change**: Positive (increase) or negative (decrease)
   - **Reason**: Explanation for adjustment
   - **Reference Number**: Optional reference
4. Click **"Save"**

### Batch Management

1. Go to **Inventory** → **Products** → Click product
2. View batches:
   - Batch number
   - Quantity
   - Expiry date
   - Cost
3. Actions:
   - View batch details
   - Adjust batch quantity
   - Mark batch as expired

### Reorder Points

1. Go to **Inventory** → Select product
2. Click **"Edit Reorder Point"**
3. Set:
   - **Reorder Point**: Minimum stock level
   - **Suggested Quantity**: Recommended order amount
4. Click **"Save"**

### Reorder Suggestions

1. Go to **Reports** → **Reorder Suggestions**
2. View products needing reorder
3. Filter: Show only below reorder point
4. Use suggestions to create purchase orders

---

## Purchasing Operations

### Creating Purchase Order

1. Navigate to **Purchasing** → **Purchase Orders** (`/admin/purchasing/purchase-orders`)
2. Click **"New Purchase Order"**
3. Fill in:
   - **Supplier**: Select from dropdown
   - **Expected Delivery Date**: Optional
   - **Items**: Add products
     - Select product
     - Enter quantity
     - Enter unit price
4. Review total amount
5. Click **"Save"** (creates as Draft)
6. Click **"Approve"** to approve PO

### Receiving Goods (GRN)

1. Go to **Purchasing** → **GRN** (`/admin/purchasing/grn`)
2. Click **"New GRN"**
3. Select:
   - **Supplier**: Select supplier
   - **Purchase Order**: Optional (if from PO)
   - **Received Date**: Date of receipt
4. Add items:
   - Select product
   - Enter received quantity
   - Enter unit cost
   - Enter expiry date (if applicable)
   - Enter batch number (optional)
5. Upload invoice (optional):
   - Click "Upload Invoice"
   - Select PDF/image file
6. Click **"Save"** (creates as Draft)
7. Click **"Confirm"** to confirm GRN
   - This updates inventory automatically

### Viewing Purchase Orders

1. Go to **Purchasing** → **Purchase Orders**
2. View list with:
   - PO number
   - Supplier name
   - Status (Draft, Approved, Received, Cancelled)
   - Total amount
   - Date
3. Click on PO to view details
4. Actions:
   - Edit (if Draft)
   - Approve (if Draft)
   - Cancel (if not Received)
   - Create GRN (if Approved)

### Supplier Returns

1. Go to **Purchasing** → **Supplier Returns**
2. Click **"New Return"**
3. Select:
   - **Supplier**: Select supplier
   - **GRN**: Optional (if returning from specific GRN)
4. Add return items:
   - Select product
   - Enter return quantity
   - Enter reason
5. Click **"Save"**
   - This reduces inventory automatically

### Supplier Payments

1. Go to **Suppliers** → **Payments** (`/admin/suppliers/payments`)
2. **Record Payment**:
   - Select supplier
   - Enter amount
   - Select payment method (Cash, UPI, Card, Bank Transfer, Cheque)
   - Enter payment date
   - Link to PO/GRN (optional)
   - Enter reference number (optional)
   - Add notes (optional)
   - Click **"Record Payment"**
3. **View Outstanding Payments**:
   - Go to "Outstanding Payments" tab
   - See suppliers with unpaid amounts
   - View unpaid GRNs count
4. **View Payment History**:
   - Go to "Payment History" tab
   - Select supplier
   - View all payments

---

## Point of Sale (POS)

### Accessing POS

- URL: `/pos`
- No login required (public interface)
- Optimized for touchscreen

### POS Interface Overview

**Left Side**: Product Categories
- Click category to filter products
- Multiple category selection supported

**Center**: Product Grid
- Products displayed as tiles
- Shows: Name, Price, Stock status
- Color coding:
  - Green: In stock
  - Yellow: Low stock
  - Red: Out of stock

**Right Side**: Cart
- Selected items
- Quantities
- Subtotal
- Discounts
- Total

### Making a Sale

#### Step 1: Add Products to Cart

**Method 1: Click Product Tile**
1. Click on product tile
2. Product added with quantity 1
3. Click again to increase quantity

**Method 2: Barcode Scanning**
1. Click barcode scanner icon
2. Scan barcode with scanner/camera
3. Product automatically added

**Method 3: Voice Command**
1. Click microphone icon
2. Say: "Add [product name] [quantity]"
   - Example: "Add Rice 2"
3. Product added automatically

**Method 4: Weight Scale (for weight-based products)**
1. Click on weight-based product (kg, gram)
2. System reads weight from scale
3. If scale unavailable, enter weight manually

#### Step 2: Adjust Quantities

- Click **+** to increase quantity
- Click **-** to decrease quantity
- Or enter quantity directly in cart

#### Step 3: Select Customer (Optional)

1. Click **"Select Customer"**
2. Search by phone number or name
3. Select customer
   - Loyalty points shown
   - Pay-later balance shown
   - Saved items available
4. Or click **"Guest"** for walk-in customer

#### Step 4: Apply Discounts (Optional)

1. **Coupon Code**:
   - Enter coupon code
   - Click "Apply"
   - Discount applied automatically

2. **Manual Discount**:
   - Click "Apply Discount"
   - Enter discount amount or percentage
   - Click "Apply"

#### Step 5: Checkout

1. Review cart:
   - Items
   - Quantities
   - Prices
   - Discounts
   - Total

2. Click **"Checkout"**

3. **Payment Method Selection**:
   - **Cash**: Enter cash received, change calculated
   - **UPI**: Enter UPI amount
   - **Card**: Enter card amount
   - **Pay Later**: For credit customers
   - **Split Payment**: Combine multiple methods

4. **Loyalty Points** (if customer selected):
   - Option to redeem points
   - Points earned shown

5. Click **"Complete Sale"**

6. **Receipt Options**:
   - Print receipt (if printer connected)
   - Email receipt (if email configured)
   - View invoice

### POS Features

- **Offline Mode**: Works without internet, syncs when online
- **Keyboard Shortcuts**: 
  - `F1`: Focus search
  - `F2`: Open cart
  - `F3`: Checkout
  - `Esc`: Cancel
- **Voice Commands**: 
  - "Add [product] [qty]"
  - "Remove [product]"
  - "Checkout"
  - "Clear cart"
- **Weight Scale Integration**: Automatic weight reading
- **Barcode Scanning**: Camera or scanner support

### Queue Management (Service Tokens)

1. Click **"Generate Token"** button
2. Enter customer name/phone (optional)
3. Token number generated
4. Display token on screen
5. Call token when ready to serve
6. Mark token as served after sale

---

## Sales Management

### Viewing Sales

1. Navigate to **Sales** (`/admin/sales`)
2. View sales list with:
   - Invoice number
   - Date
   - Customer name
   - Total amount
   - Payment method
   - Status
3. Use filters:
   - Date range
   - Customer
   - Payment method
   - Status
4. Click on sale to view details

### Sale Details

1. Click on sale from list
2. View complete information:
   - Invoice details
   - Customer information
   - Items sold
   - Payment breakdown
   - Discounts applied
   - GST breakdown
   - Loyalty points earned/redeemed
3. Actions:
   - **Print Receipt**: Print thermal receipt
   - **Create Return**: Process return
   - **Download Invoice**: Download PDF invoice

### Processing Returns

1. Go to **Sales** → Click on sale
2. Click **"Create Return"** button
3. Select items to return:
   - Check items
   - Enter return quantity
   - Select return reason
4. Review return summary
5. Click **"Create Return"**
6. **Process Refund**:
   - Go to return details
   - Click **"Process Refund"**
   - Select refund method
   - Enter amount
   - Click **"Process"**
   - Inventory automatically restored

---

## Customer Management

### Viewing Customers

1. Navigate to **Customers** (`/admin/customers`)
2. View customer list
3. Search by:
   - Name
   - Phone number
   - Email
4. Click on customer to view details

### Creating Customer

1. Go to **Customers** → Click **"New Customer"**
2. Fill in form:
   - **Name**: Customer name (required)
   - **Phone**: Phone number (required, unique)
   - **Email**: Email address (optional)
   - **Address**: Address (optional)
   - **Pay Later Settings**:
     - Enable/disable pay-later
     - Set credit limit
3. Click **"Save"**

### Customer Details

1. Click on customer from list
2. View tabs:
   - **Overview**: Basic information
   - **Purchase History**: All past purchases
   - **Pay Later Ledger**: Credit transactions
   - **Saved Items**: Frequently purchased items
   - **Loyalty Points**: Points history

### Pay Later Management

1. Go to customer details → **Pay Later Ledger**
2. View:
   - Outstanding balance
   - Transaction history
   - Payment due dates
3. **Record Payment**:
   - Click **"Record Payment"**
   - Enter amount
   - Select payment method
   - Enter reference number
   - Click **"Save"**

### Loyalty Points

1. View customer details → **Loyalty Points**
2. See:
   - Current balance
   - Points earned
   - Points redeemed
   - Transaction history
3. Points automatically earned on purchases
4. Points can be redeemed at POS

---

## Supplier Management

### Viewing Suppliers

1. Navigate to **Suppliers** (`/admin/suppliers`)
2. View supplier list
3. Search by name
4. Click on supplier to view details

### Creating Supplier

1. Go to **Suppliers** → Click **"New Supplier"**
2. Fill in:
   - **Name**: Supplier name (required)
   - **Contact Person**: Contact name
   - **Phone**: Phone number
   - **Email**: Email address
   - **Address**: Full address
   - **GSTIN**: GST number (optional)
3. Click **"Save"**

### Supplier Details

- View supplier information
- See purchase orders
- View GRNs
- Check payment history
- View outstanding payments

---

## Reports & Analytics

### Accessing Reports

1. Navigate to **Reports** (`/admin/reports`)
2. Select report type from menu

### Daily Sales Report

1. Go to **Reports** → **Daily Sales**
2. Select date (default: today)
3. View:
   - Total sales
   - Revenue
   - Tax collected
   - Discounts given
   - Payment method breakdown
   - Customer count

### GST Reports

1. **GST Summary**:
   - Go to **Reports** → **GST Summary**
   - Select date range
   - View GST breakdown by tax slab
   - See CGST/SGST split

2. **GST Export**:
   - Go to **Reports** → **GST Export**
   - Select date range
   - Click **"Export GSTR-1"** (Sales) or **"Export GSTR-2"** (Purchases)
   - Excel file downloads automatically

### Product Reports

1. **Fast-Moving Products**:
   - Go to **Reports** → **Fast-Moving**
   - Select date range
   - View top-selling products
   - See quantities sold and revenue

2. **Slow-Moving Products**:
   - Go to **Reports** → **Slow-Moving**
   - Select date range and thresholds
   - View products with low sales
   - Identify products to discount or discontinue

3. **Item-wise Sales**:
   - Go to **Reports** → **Item-wise Sales**
   - Select date range
   - View sales by product
   - See quantities, amounts, average prices

### Inventory Reports

1. **Low Stock Report**:
   - Go to **Reports** → **Low Stock**
   - Set threshold (optional)
   - View products below threshold
   - See reorder points and suggested quantities

2. **Expiry Report**:
   - Go to **Reports** → **Expiry**
   - Set days threshold (default: 30 days)
   - View batches expiring soon
   - See quantities and expiry dates

3. **Reorder Suggestions**:
   - Go to **Reports** → **Reorder Suggestions**
   - Toggle: Show only below reorder point
   - View products needing reorder
   - See suggested quantities and estimated costs

---

## Settings & Configuration

### Store Settings

1. Navigate to **Settings** (`/admin/settings`)
2. Configure:
   - **Store Name**: Your store name
   - **GSTIN**: GST registration number
   - **Address**: Store address
   - **Contact**: Phone and email
   - **Packing Charges**: Default packing charges
   - **Home Delivery**: Enable/disable and charges
   - **Loyalty Points**: Points per ₹100 spent

3. Click **"Save"**

### User Management

1. Go to **Settings** → **Roles** (`/admin/settings/roles`)
2. View roles:
   - SuperAdmin
   - Admin
   - Staff
3. Manage users:
   - Create users
   - Assign roles
   - Activate/deactivate users

### Permission Management

1. Go to **Settings** → **Permissions** (`/admin/settings/permissions`)
2. Select role from dropdown
3. View available permissions
4. Check/uncheck to assign permissions
5. Permissions automatically saved

### Role Management

1. Go to **Settings** → **Roles**
2. View role details
3. Assign users to roles
4. Configure role permissions

---

## Troubleshooting

### Common Issues

#### 1. Cannot Login

**Problem**: Login fails even with correct credentials

**Solutions**:
- Check if account is active
- Verify email/username is correct
- Try resetting password (contact admin)
- Clear browser cache and cookies
- Try different browser

#### 2. Products Not Showing in POS

**Problem**: Products don't appear in POS interface

**Solutions**:
- Check if products are marked as "Active"
- Verify category filters
- Check if products have stock
- Refresh the page
- Clear browser cache

#### 3. Stock Not Updating

**Problem**: Inventory doesn't reflect after GRN

**Solutions**:
- Ensure GRN is "Confirmed" (not Draft)
- Check if GRN items have quantities
- Verify product exists
- Check inventory adjustment history
- Contact admin if issue persists

#### 4. Receipt Not Printing

**Problem**: Thermal printer not printing receipts

**Solutions**:
- Check printer connection (serial port)
- Verify printer is powered on
- Check printer settings in configuration
- Try manual print from sale details
- Verify printer driver installation

#### 5. Weight Scale Not Working

**Problem**: Weight not reading from scale

**Solutions**:
- Check scale connection (serial port)
- Verify scale is powered on
- Check scale settings in configuration
- Try manual weight entry
- Verify scale driver installation

#### 6. Offline Mode Not Working

**Problem**: POS doesn't work offline

**Solutions**:
- Check browser supports IndexedDB
- Verify offline storage is enabled
- Check browser storage quota
- Clear old offline data
- Refresh page

#### 7. Import Failing

**Problem**: Product import shows errors

**Solutions**:
- Check file format (Excel/JSON)
- Verify column mapping
- Check required fields are present
- Review error report
- Fix errors and retry failed rows

#### 8. Reports Not Loading

**Problem**: Reports show no data or error

**Solutions**:
- Check date range is valid
- Verify you have permission to view reports
- Try different date range
- Clear browser cache
- Contact admin if issue persists

### Getting Help

1. **Check Documentation**: Refer to this guide
2. **Contact Admin**: For account/permission issues
3. **System Logs**: Admin can check system logs
4. **Support**: Contact system administrator

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

## Best Practices

### Daily Operations

1. **Start of Day**:
   - Check dashboard for alerts
   - Review low stock items
   - Check expiring batches
   - Verify POS is working

2. **During Day**:
   - Process sales through POS
   - Monitor inventory levels
   - Handle customer returns promptly
   - Record supplier payments

3. **End of Day**:
   - Review daily sales report
   - Check daily closing summary
   - Verify all transactions
   - Print/export reports

### Inventory Management

1. Set reorder points for all products
2. Review reorder suggestions daily
3. Check expiry reports weekly
4. Adjust stock immediately when discrepancies found
5. Keep batch information accurate

### Sales Management

1. Always select customer when possible (for loyalty)
2. Apply discounts correctly
3. Process returns within return policy
4. Print receipts for all sales
5. Verify payment methods match actual payment

### Data Entry

1. Enter accurate product information
2. Use consistent naming conventions
3. Keep barcodes updated
4. Maintain supplier contact information
5. Update customer details regularly

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

