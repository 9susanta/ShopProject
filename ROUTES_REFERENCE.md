# Routes Reference Guide

Complete reference for all routes in the Grocery Store ERP + POS System.

---

## Frontend Routes

### Base Routes

| Route | Component | Description | Auth Required |
|-------|-----------|-------------|---------------|
| `/` | Redirect | Redirects to `/admin/dashboard` | No |
| `/login` | LoginComponent | User login page | No |
| `/admin/*` | AdminLayoutComponent | Admin area (requires AdminGuard) | Yes (Admin) |
| `/pos` | PosComponent | Point of Sale interface | No |

---

## Admin Routes (`/admin/*`)

### Dashboard

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/dashboard` | DashboardComponent | Admin dashboard with sales overview, inventory summary, fast-moving products |

### Products (`/admin/products`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/products` | ProductListComponent | Product list with filters and pagination |
| `/admin/products/new` | ProductCreateComponent | Create new product |
| `/admin/products/edit/:id` | ProductFormComponent | Edit existing product |
| `/admin/products/:id` | ProductDetailsComponent | View product details |

### Imports (`/admin/imports`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/imports` | ImportPageComponent | Import dashboard |
| `/admin/imports/upload` | ImportUploadComponent | Upload file for import |
| `/admin/imports/jobs` | ImportJobsListComponent | List of import jobs |
| `/admin/imports/jobs/:id` | ImportJobDetailsComponent | Import job details with errors |

### Inventory (`/admin/inventory`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/inventory` | InventoryDashboardComponent | Inventory dashboard |
| `/admin/inventory/products` | ProductBatchListComponent | Products with batch information |
| `/admin/inventory/product/:productId` | BatchDetailsComponent | Product batch details |
| `/admin/inventory/product/:productId/batches` | BatchDetailsComponent | Product batches (alias) |
| `/admin/inventory/low-stock` | LowStockListComponent | Low stock products |
| `/admin/inventory/expiry` | ExpiryListComponent | Expiring batches |
| `/admin/inventory/adjust` | InventoryAdjustComponent | Manual stock adjustment |
| `/admin/inventory/list` | InventoryListComponent | Complete inventory list |
| `/admin/inventory/expiry-management` | ExpiryManagementComponent | Expiry management tools |

### Purchasing (`/admin/purchasing`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/purchasing` | Redirect | Redirects to purchase orders |
| `/admin/purchasing/purchase-orders` | PurchaseOrderListComponent | Purchase orders list |
| `/admin/purchasing/purchase-orders/new` | PurchaseOrderFormComponent | Create new purchase order |
| `/admin/purchasing/purchase-orders/:id` | PurchaseOrderDetailsComponent | Purchase order details |
| `/admin/purchasing/purchase-orders/:id/edit` | PurchaseOrderFormComponent | Edit purchase order |
| `/admin/purchasing/grn` | GRNListComponent | Goods Receive Notes list |
| `/admin/purchasing/grn/new` | GRNFormComponent | Create new GRN |
| `/admin/purchasing/grn/:id` | GRNDetailsComponent | GRN details |
| `/admin/purchasing/grn/:id/confirm` | GRNConfirmComponent | Confirm GRN |
| `/admin/purchasing/supplier-returns` | SupplierReturnsListComponent | Supplier returns list |
| `/admin/purchasing/supplier-returns/new` | SupplierReturnFormComponent | Create supplier return |

### Sales (`/admin/sales`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/sales` | SalesListComponent | Sales list with filters |
| `/admin/sales/:id` | SaleDetailsComponent | Sale details with print receipt option |
| `/admin/sales/:id/return` | SaleReturnFormComponent | Create sale return |

### Customers (`/admin/customers`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/customers` | CustomersListComponent | Customer list |
| `/admin/customers/new` | CustomerFormComponent | Create new customer |
| `/admin/customers/:id` | CustomerDetailsComponent | Customer details with purchase history, ledger, saved items |
| `/admin/customers/:id/edit` | CustomerFormComponent | Edit customer |

### Suppliers (`/admin/suppliers`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/suppliers` | SuppliersListComponent | Supplier list |
| `/admin/suppliers/new` | SupplierFormComponent | Create new supplier |
| `/admin/suppliers/:id` | SupplierDetailsComponent | Supplier details |
| `/admin/suppliers/:id/edit` | SupplierFormComponent | Edit supplier |
| `/admin/suppliers/payments` | SupplierPaymentsComponent | Supplier payment management (record payments, view outstanding, payment history) |

### Reports (`/admin/reports`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/reports` | ReportsComponent | Reports dashboard |
| `/admin/reports/daily-sales` | DailySalesComponent | Daily sales report |
| `/admin/reports/gst-summary` | GstSummaryComponent | GST summary report |
| `/admin/reports/gst-export` | GSTExportComponent | GSTR-1 and GSTR-2 export |
| `/admin/reports/fast-moving` | FastMovingComponent | Fast-moving products report |
| `/admin/reports/slow-moving` | SlowMovingComponent | Slow-moving products report |
| `/admin/reports/item-wise-sales` | ItemWiseSalesComponent | Item-wise sales report |
| `/admin/reports/low-stock` | LowStockComponent | Low stock report |
| `/admin/reports/expiry` | ExpiryComponent | Expiry report |
| `/admin/reports/reorder-suggestions` | ReorderSuggestionsComponent | Reorder suggestions |

### Settings (`/admin/settings`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/settings` | StoreSettingsComponent | Store settings (GSTIN, address, loyalty settings) |
| `/admin/settings/roles` | RolesPermissionsComponent | Role management |
| `/admin/settings/permissions` | PermissionsComponent | Permission management and assignment |

### Adjustments (`/admin/inventory/adjustments`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/inventory/adjustments` | AdjustmentHistoryComponent | Adjustment history |
| `/admin/inventory/adjustments/new` | AdjustmentFormComponent | Create new adjustment |

### Audit (`/admin/audit`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/audit` | AuditLogsComponent | Audit logs (Admin only) |

### Accounting (`/admin/accounting`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/accounting` | Redirect | Redirects to daily closing |
| `/admin/accounting/daily-closing` | DailyClosingComponent | Daily closing summary (Admin only) |

### Offers (`/admin/offers`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/offers` | OfferListComponent | Offers list |
| `/admin/offers/new` | OfferFormComponent | Create new offer |
| `/admin/offers/edit/:id` | OfferFormComponent | Edit offer |

### Profile (`/admin/profile`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/profile` | ProfileComponent | User profile (Admin only) |

---

## POS Routes (`/pos`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/pos` | PosComponent | Point of Sale interface with product search, cart, checkout, barcode scanning, voice commands, weight scale integration |

---

## Backend API Routes

### Authentication (`/api/auth`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh` | Refresh JWT token | No |
| POST | `/api/auth/logout` | User logout | Yes |

### Products (`/api/products`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/products` | Get products (paginated, filtered) | Yes |
| GET | `/api/products/{id}` | Get product by ID | Yes |
| GET | `/api/products/search` | Search products | Yes |
| GET | `/api/products/by-barcode/{barcode}` | Get product by barcode | Yes |
| GET | `/api/products/by-category/{categoryId}` | Get products by category | Yes |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/{id}` | Update product | Admin |
| DELETE | `/api/products/{id}` | Delete product | Admin |

### Categories (`/api/categories`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/categories` | Get all categories | Yes |
| GET | `/api/categories/{id}` | Get category by ID | Yes |
| POST | `/api/categories` | Create category | Admin |
| PUT | `/api/categories/{id}` | Update category | Admin |
| DELETE | `/api/categories/{id}` | Delete category | Admin |

### Units (`/api/units`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/units` | Get all units | Yes |
| POST | `/api/units` | Create unit | Admin |
| PUT | `/api/units/{id}` | Update unit | Admin |

### Tax Slabs (`/api/taxslabs`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/taxslabs` | Get all tax slabs | Yes |
| POST | `/api/taxslabs` | Create tax slab | Admin |
| PUT | `/api/taxslabs/{id}` | Update tax slab | Admin |

### Suppliers (`/api/suppliers`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/suppliers` | Get suppliers (paginated) | Yes |
| GET | `/api/suppliers/{id}` | Get supplier by ID | Yes |
| POST | `/api/suppliers` | Create supplier | Admin |
| PUT | `/api/suppliers/{id}` | Update supplier | Admin |
| DELETE | `/api/suppliers/{id}` | Delete supplier | Admin |

### Supplier Payments (`/api/suppliers`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/suppliers/{supplierId}/payments` | Record payment | Admin |
| GET | `/api/suppliers/outstanding` | Get outstanding payments | Admin |
| GET | `/api/suppliers/{supplierId}/payments` | Get payment history | Admin |

### Customers (`/api/customers`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/customers` | Get customers (paginated) | Yes |
| GET | `/api/customers/{id}` | Get customer by ID | Yes |
| GET | `/api/customers/by-phone/{phone}` | Get customer by phone | Yes |
| GET | `/api/customers/{id}/purchase-history` | Get purchase history | Yes |
| GET | `/api/customers/{id}/ledger` | Get pay-later ledger | Yes |
| GET | `/api/customers/{id}/saved-items` | Get saved items | Yes |
| POST | `/api/customers` | Create customer | Yes |
| POST | `/api/customers/{id}/saved-items` | Add saved item | Yes |
| PUT | `/api/customers/{id}` | Update customer | Yes |
| PUT | `/api/customers/{id}/pay-later-settings` | Update pay-later settings | Admin |
| POST | `/api/customers/{id}/pay-later-payment` | Record pay-later payment | Admin |

### Purchasing (`/api/purchasing`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/purchasing/purchase-orders` | Get purchase orders | Yes |
| GET | `/api/purchasing/purchase-orders/{id}` | Get PO by ID | Yes |
| POST | `/api/purchasing/purchase-orders` | Create PO | Admin |
| PUT | `/api/purchasing/purchase-orders/{id}` | Update PO | Admin |
| POST | `/api/purchasing/purchase-orders/{id}/approve` | Approve PO | Admin |
| POST | `/api/purchasing/purchase-orders/{id}/cancel` | Cancel PO | Admin |
| GET | `/api/purchasing/grn` | Get GRNs | Yes |
| GET | `/api/purchasing/grn/{id}` | Get GRN by ID | Yes |
| POST | `/api/purchasing/grn` | Create GRN | Admin |
| POST | `/api/purchasing/grn/{id}/confirm` | Confirm GRN | Admin |
| POST | `/api/purchasing/grn/{id}/cancel` | Cancel GRN | Admin |
| GET | `/api/purchasing/supplier-returns` | Get supplier returns | Yes |
| GET | `/api/purchasing/supplier-returns/{id}` | Get supplier return by ID | Yes |
| POST | `/api/purchasing/supplier-returns` | Create supplier return | Admin |

### GRN (`/api/purchasing/grn`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/purchasing/grn/upload-invoice` | Upload invoice file | Admin |

### Inventory (`/api/inventory`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/inventory/products` | Get inventory products | Yes |
| GET | `/api/inventory/product/{id}` | Get product inventory | Yes |
| GET | `/api/inventory/low-stock` | Get low stock products | Yes |
| GET | `/api/inventory/expiry-soon` | Get expiring batches | Yes |
| GET | `/api/inventory/valuation` | Get inventory valuation | Yes |
| GET | `/api/inventory/reorder-suggestions` | Get reorder suggestions | Yes |
| PUT | `/api/inventory/products/{productId}/reorder-point` | Update reorder point | Admin |
| POST | `/api/inventory/adjustment` | Stock adjustment | Admin |

### Admin Inventory (`/api/admin/inventory`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/admin/inventory/adjust` | Manual stock adjustment | Admin |
| GET | `/api/admin/inventory/low-stock` | Get low stock | Admin |
| GET | `/api/admin/inventory/expiry-soon` | Get expiring batches | Admin |

### Sales (`/api/sales`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/sales` | Get sales (paginated, filtered) | Yes |
| GET | `/api/sales/{id}` | Get sale by ID | Yes |
| POST | `/api/sales/pos` | Create POS sale | Yes |
| POST | `/api/sales` | Create sale | Yes |

### Sale Returns (`/api/sales`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/sales/returns` | Get sale returns | Yes |
| GET | `/api/sales/returns/{id}` | Get sale return by ID | Yes |
| POST | `/api/sales/{saleId}/return` | Create sale return | Admin |
| POST | `/api/sales/returns/{id}/refund` | Process refund | Admin |

### Reports (`/api/reports`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/reports/daily-sales` | Daily sales report | Admin |
| GET | `/api/reports/gst-summary` | GST summary report | Admin |
| GET | `/api/reports/fast-moving` | Fast-moving products | Admin |
| GET | `/api/reports/slow-moving` | Slow-moving products | Admin |
| GET | `/api/reports/item-wise-sales` | Item-wise sales report | Admin |
| GET | `/api/reports/low-stock` | Low stock report | Admin |
| GET | `/api/reports/expiry` | Expiry report | Admin |
| GET | `/api/reports/reorder-suggestions` | Reorder suggestions | Admin |

### GST Export (`/api/gst`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/gst/gstr1` | Export GSTR-1 (Excel) | Admin |
| GET | `/api/gst/gstr2` | Export GSTR-2 (Excel) | Admin |

### Offers (`/api/offers`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/offers` | Get offers | Yes |
| GET | `/api/offers/{id}` | Get offer by ID | Yes |
| POST | `/api/offers` | Create offer | Admin |
| PUT | `/api/offers/{id}` | Update offer | Admin |
| DELETE | `/api/offers/{id}` | Delete offer | Admin |
| POST | `/api/offers/validate-coupon` | Validate coupon code | Yes |

### Print (`/api/print`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/print/receipt` | Print receipt | Yes |
| POST | `/api/print/barcode` | Print barcode | Yes |

### Weight Scale (`/api/weight-scale`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/weight-scale/read` | Read weight | Yes |
| POST | `/api/weight-scale/tare` | Tare scale | Yes |
| GET | `/api/weight-scale/status` | Connection status | Yes |

### Sync (`/api/sync`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/sync/offline-sales` | Sync offline sales | Yes |

### Service Tokens (`/api/service-tokens`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/service-tokens` | Get tokens | Yes |
| POST | `/api/service-tokens` | Create token | Yes |
| POST | `/api/service-tokens/{id}/call` | Call token | Yes |
| POST | `/api/service-tokens/{id}/serve` | Serve token | Yes |
| POST | `/api/service-tokens/{id}/cancel` | Cancel token | Yes |

### Users (`/api/users`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/users` | Get users | Admin |
| GET | `/api/users/{id}` | Get user by ID | Admin |
| POST | `/api/users` | Create user | Admin |
| PUT | `/api/users/{id}` | Update user | Admin |
| DELETE | `/api/users/{id}` | Delete user | Admin |

### Permissions (`/api/permissions`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/permissions` | Get all permissions | Admin |
| GET | `/api/permissions/role/{roleName}` | Get role permissions | Admin |
| GET | `/api/permissions/me` | Get current user permissions | Yes |
| POST | `/api/permissions/assign` | Assign permission to role | Admin |

### Store Settings (`/api/storesettings`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/storesettings` | Get store settings | Yes |
| PUT | `/api/storesettings` | Update store settings | Admin |

### Master Data (`/api/master`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/master/categories` | Get categories | Yes |
| GET | `/api/master/products` | Get products | Yes |
| GET | `/api/master/units` | Get units | Yes |
| GET | `/api/master/taxslabs` | Get tax slabs | Yes |

### Dashboard (`/api/admin/dashboard`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/admin/dashboard` | Get dashboard data | Admin |

### Accounting (`/api/accounting`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/accounting/daily-closing` | Get daily closing summary | Admin |
| GET | `/api/accounting/daily-closing/{date}` | Get closing for specific date | Admin |

### Imports (`/api/admin/imports`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/admin/imports` | Create import job | Admin |
| GET | `/api/admin/imports/jobs` | Get import jobs | Admin |
| GET | `/api/admin/imports/jobs/{id}` | Get import job details | Admin |

### Audit (`/api/admin/audits`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/admin/audits` | Get audit logs | Admin |

### Cache (`/api/cache`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| DELETE | `/api/cache` | Clear cache | Admin |

---

## Route Guards

### Frontend Guards

- **AuthGuard** - Requires user to be authenticated
- **AdminGuard** - Requires Admin or SuperAdmin role
- **PermissionGuard** - Requires specific permission

### Backend Authorization

- **Roles**: `Admin`, `Staff`, `SuperAdmin`
- **Permissions**: Granular permission-based access control

---

## Route Patterns

### Frontend Route Pattern:
```
/admin/{module}/{action}/{id}
```

Examples:
- `/admin/products` - List
- `/admin/products/new` - Create
- `/admin/products/:id` - View
- `/admin/products/:id/edit` - Edit

### Backend API Pattern:
```
/api/{module}/{resource}/{action}
```

Examples:
- `/api/products` - List/Create
- `/api/products/{id}` - Get/Update/Delete
- `/api/sales/pos` - Create POS sale
- `/api/sales/{id}/return` - Create return

---

## Quick Navigation Guide

### For Store Managers:
- Dashboard: `/admin/dashboard`
- Sales: `/admin/sales`
- Inventory: `/admin/inventory`
- Reports: `/admin/reports`

### For Cashiers:
- POS: `/pos`
- Sales History: `/admin/sales`

### For Admins:
- All above routes
- Settings: `/admin/settings`
- Users: `/admin/settings/roles`
- Permissions: `/admin/settings/permissions`
- Audit: `/admin/audit`

---

## Notes

- All admin routes require authentication
- Most write operations require Admin role
- Some routes require specific permissions
- POS route (`/pos`) is publicly accessible (no auth required)
- Legacy routes redirect to new admin routes for backward compatibility

