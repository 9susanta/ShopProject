# Focused Gap Analysis - Essential Features Only

**Date:** 2024-12-19  
**Scope:** Only missing/incomplete features from required list  
**Approach:** Incremental, non-destructive additions

---

## TASK 1 — GAP ANALYSIS

### ✅ WHAT EXISTS (Partial/Complete)

1. **Supplier Return** - ✅ Domain entity exists (`SupplierReturn.cs`), but API/UI missing
2. **Inventory Adjustment** - ✅ Domain entity exists (`InventoryAdjustment.cs`), but API/UI missing  
3. **GST Calculations** - ✅ Complete (CGST/SGST in SaleItem, GST calculation in handlers)
4. **Daily Sales Report** - ✅ Complete (Query, Handler, Controller, Angular component)
5. **GST Summary Report** - ✅ Complete (Query, Handler, Controller, Angular component)
6. **Fast Moving Products Report** - ✅ Complete (Query, Handler, Controller, Angular component)
7. **Basic Notifications** - ✅ Complete (Low stock, expiry soon via SignalR/SMS)
8. **Weight-based Products** - ✅ Partial (Product has `IsWeightBased` property, but no weight machine integration)
9. **Basic Validation** - ✅ Partial (FluentValidation exists, but missing business rule validations)

---

## ❌ MISSING OR INCOMPLETE FEATURES

### 1. SALES RETURN / REFUND ❌ COMPLETELY MISSING

**Status:** Not implemented at all

**Missing Components:**
- **Domain:** No `SaleReturn` entity, no `Refund` entity
- **Application:** No commands/queries for returns/refunds
- **Infrastructure:** No EF Core configuration
- **API:** No `SaleReturnsController`
- **Angular:** No return form, refund processing, return history components

**What Needs to Be Built:**
- Simple return entity (SaleId, ReturnDate, Reason, Items, RefundAmount, Status)
- Simple refund entity (SaleReturnId, Amount, PaymentMethod, Status)
- Return processing that restores inventory
- Refund processing (cash/UPI reversal)
- Return approval workflow (optional, can be auto-approved for simplicity)

---

### 2. SUPPLIER RETURN ❌ INCOMPLETE

**Status:** Domain entity exists, but API/UI missing

**What Exists:**
- ✅ `SupplierReturn.cs` entity
- ✅ `SupplierReturnItem.cs` entity
- ✅ `SupplierReturnEvent.cs` domain event

**Missing Components:**
- **Application:** No commands/queries (CreateSupplierReturnCommand, GetSupplierReturnsQuery)
- **Infrastructure:** EF Core config may exist, need to verify
- **API:** No endpoints in PurchasingController or separate SupplierReturnsController
- **Angular:** No supplier return form component, no return list component

**What Needs to Be Built:**
- Commands: `CreateSupplierReturnCommand`, `ApproveSupplierReturnCommand`
- Queries: `GetSupplierReturnsQuery`, `GetSupplierReturnByIdQuery`
- API endpoints: `POST /api/purchasing/supplier-returns`, `GET /api/purchasing/supplier-returns`
- Angular: `supplier-return-form.component.ts`, `supplier-returns-list.component.ts`

---

### 3. BASIC OFFLINE POS ❌ COMPLETELY MISSING

**Status:** Not implemented at all

**Missing Components:**
- **Domain:** No changes needed (use existing Sale entity)
- **Application:** No sync commands/queries
- **Infrastructure:** No sync queue entity
- **API:** No sync endpoints
- **Angular:** No IndexedDB service, no offline detection, no sync queue service

**What Needs to Be Built:**
- IndexedDB wrapper service for local storage
- Offline detection service
- Sync queue service (manages pending sales)
- Sync API endpoint: `POST /api/sync/offline-sales`
- Offline indicator component
- Modify POS to save to IndexedDB when offline
- Sync on connection restore

---

### 4. WEIGHT MACHINE INTEGRATION ❌ COMPLETELY MISSING

**Status:** Product has `IsWeightBased` property, but no integration

**What Exists:**
- ✅ `Product.IsWeightBased` property
- ✅ `Product.WeightPerUnit` property

**Missing Components:**
- **Application:** No `IWeightScaleService` interface
- **Infrastructure:** No weight scale service implementation (RS232/USB)
- **API:** No weight scale controller
- **Angular:** No weight scale service, no weight input in POS

**What Needs to Be Built:**
- `IWeightScaleService` interface
- `WeightScaleService` implementation (RS232/USB serial communication)
- `WeightScaleController` with endpoints: `GET /api/weight-scale/read`, `POST /api/weight-scale/tare`
- Angular `weight-scale.service.ts`
- Enhance POS to show weight input for weight-based products
- Call weight scale API when scanning weight-based product

---

### 5. THERMAL RECEIPT PRINTING ❌ INCOMPLETE

**Status:** PDF generation exists, but thermal printing missing

**What Exists:**
- ✅ `IPdfService` interface
- ✅ `PdfService` implementation (QuestPDF)
- ✅ PDF invoice generation in `CreatePOSSaleCommandHandler`

**Missing Components:**
- **Application:** No `IReceiptPrinterService` interface
- **Infrastructure:** No ESC/POS thermal printer service
- **API:** No print endpoints
- **Angular:** No print service, no print button in sale details

**What Needs to Be Built:**
- `IReceiptPrinterService` interface
- `ReceiptPrinterService` implementation (ESC/POS commands)
- `PrintController` with endpoint: `POST /api/print/receipt`
- Angular `receipt-printer.service.ts`
- Print button in sale details component
- Receipt template (simple, hardcoded for now)

---

### 6. SUPPLIER PAYMENT TRACKING ❌ COMPLETELY MISSING

**Status:** Not implemented at all

**Missing Components:**
- **Domain:** No `SupplierPayment` entity, no `PaymentSchedule` entity
- **Application:** No commands/queries for payments
- **Infrastructure:** No EF Core configuration
- **API:** No payment tracking endpoints
- **Angular:** No payment tracking components

**What Needs to Be Built:**
- Simple `SupplierPayment` entity (SupplierId, Amount, PaymentDate, PaymentMethod, Reference)
- `CreateSupplierPaymentCommand`, `GetOutstandingPaymentsQuery`
- API endpoints: `POST /api/suppliers/{id}/payments`, `GET /api/suppliers/{id}/outstanding`
- Angular: `supplier-payments.component.ts`, `outstanding-payments.component.ts`

---

### 7. GST COMPLIANCE (GSTR-1, GSTR-2, Monthly Summary) ❌ INCOMPLETE

**Status:** GST calculation exists, but export missing

**What Exists:**
- ✅ GST calculation in sales (CGST/SGST)
- ✅ `GSTSummaryReportDto` and query handler
- ✅ GST Summary Report (monthly summary exists)

**Missing Components:**
- **Application:** No GSTR-1 export command/query
- **Application:** No GSTR-2 export command/query
- **Infrastructure:** No GST export service
- **API:** No GSTR export endpoints
- **Angular:** No GSTR export component

**What Needs to Be Built:**
- `IGSTExportService` interface
- `GSTExportService` implementation (CSV/Excel export in GSTR format)
- `ExportGSTR1Command`, `ExportGSTR2Command`
- API endpoints: `GET /api/gst/gstr1?fromDate&toDate`, `GET /api/gst/gstr2?fromDate&toDate`
- Angular: `gst-export.component.ts` with GSTR-1 and GSTR-2 export buttons

**Note:** GST monthly summary already exists via `GetGSTSummaryReportQuery`, just needs UI enhancement.

---

### 8. ROLE-BASED PERMISSIONS ❌ COMPLETELY MISSING

**Status:** Basic role-based auth exists, but granular permissions missing

**What Exists:**
- ✅ `User` entity with `Role` property (Admin, Staff, SuperAdmin)
- ✅ `[Authorize(Roles = "...")]` attributes on controllers
- ✅ Role-based route guards in Angular

**Missing Components:**
- **Domain:** No `Permission` entity, no `RolePermission` entity
- **Application:** No permission checking service
- **Infrastructure:** No permission checking logic
- **API:** No permission attributes (only role-based)
- **Angular:** No permission guards, no permission service

**What Needs to Be Built:**
- Simple `Permission` entity (Name, Description, Category)
- Simple `RolePermission` entity (RoleId, PermissionId)
- `IPermissionService` interface with `HasPermission(userId, permissionName)` method
- Permission middleware or attribute: `[RequirePermission("Sales.Create")]`
- Angular `permission.service.ts` and `permission.guard.ts`
- Permission management UI (assign permissions to roles)

---

### 9. REORDER POINTS ❌ COMPLETELY MISSING

**Status:** Not implemented at all

**Missing Components:**
- **Domain:** No reorder point properties on Product or separate entity
- **Application:** No reorder point commands/queries
- **Infrastructure:** No reorder calculation logic
- **API:** No reorder endpoints
- **Angular:** No reorder point UI

**What Needs to Be Built:**
- Add `ReorderPoint` (int) and `SuggestedReorderQuantity` (int) to `Product` entity
- `UpdateReorderPointCommand`
- `GetLowStockProductsQuery` (enhance existing or create new)
- `GetReorderSuggestionsQuery` (products below reorder point with suggested quantity)
- API endpoints: `PUT /api/products/{id}/reorder-point`, `GET /api/inventory/reorder-suggestions`
- Angular: Add reorder point fields to product form, create reorder suggestions component

---

### 10. SLOW-MOVING PRODUCTS REPORT ❌ COMPLETELY MISSING

**Status:** Not implemented at all

**Missing Components:**
- **Application:** No slow-moving products query
- **Infrastructure:** No calculation logic
- **API:** No endpoint
- **Angular:** No component

**What Needs to Be Built:**
- `GetSlowMovingProductsQuery` (products with low sales in last N days)
- `SlowMovingProductsReportDto`
- Query handler that calculates sales velocity
- API endpoint: `GET /api/reports/slow-moving?days=90&minDaysSinceLastSale=30`
- Angular: `slow-moving.component.ts` in reports module

---

### 11. BARCODE PRINTING ❌ COMPLETELY MISSING

**Status:** Not implemented at all

**Missing Components:**
- **Application:** No barcode printing service interface
- **Infrastructure:** No barcode generation/printing service
- **API:** No print endpoints
- **Angular:** No print UI

**What Needs to Be Built:**
- `IBarcodePrintService` interface
- `BarcodePrintService` implementation (generate barcode image, ESC/POS print)
- `PrintBarcodeCommand`
- API endpoint: `POST /api/print/barcode` (product ID, quantity)
- Angular: Print button in product details, bulk print component

---

### 12. BASIC DATA VALIDATION ❌ INCOMPLETE

**Status:** Partial - stock validation exists, but sale price validation missing

**What Exists:**
- ✅ Stock validation in `CreatePOSSaleCommandHandler` (line 136: checks available quantity)
- ✅ FluentValidation validators for commands
- ✅ Basic input validation

**Missing Components:**
- **Application:** No validation for "sale price < cost" in sale creation
- **Application:** No strict negative stock prevention (currently allows if available)
- **Domain:** No business rule validation methods

**What Needs to Be Built:**
- Add validation in `CreatePOSSaleCommandHandler` to check `unitPrice >= product.CostPrice` (with override flag for admin)
- Add configuration option for "strict mode" (prevent negative stock)
- Add business rule validator service (optional, can be inline)

---

### 13. BASIC NOTIFICATIONS ✅ COMPLETE

**Status:** Already implemented

**What Exists:**
- ✅ `INotificationService` interface
- ✅ `NotificationService` implementation (SignalR + SMS)
- ✅ Low stock notifications
- ✅ Expiry soon notifications
- ✅ Sale completion notifications
- ✅ Pay Later notifications (via events)

**No Action Needed**

---

### 14. INVENTORY ADJUSTMENT ❌ INCOMPLETE

**Status:** Domain entity exists, but API/UI missing

**What Exists:**
- ✅ `InventoryAdjustment.cs` entity
- ✅ `InventoryAdjustmentType` enum (Damage, Return, Expiry, etc.)

**Missing Components:**
- **Application:** Need to verify if commands/queries exist
- **API:** Need to verify if endpoints exist
- **Angular:** Need to verify if UI exists

**What Needs to Be Built (if missing):**
- `CreateInventoryAdjustmentCommand`
- `GetInventoryAdjustmentsQuery`
- API endpoints: `POST /api/inventory/adjustments`, `GET /api/inventory/adjustments`
- Angular: `inventory-adjustment-form.component.ts` (may already exist, need to verify)

---

### 15. ESSENTIAL REPORTS ❌ PARTIALLY MISSING

**Status:** Some exist, some missing

**What Exists:**
- ✅ Daily Sales Report (complete)
- ✅ GST Summary Report (complete)
- ✅ Fast Moving Products Report (complete)
- ✅ `PurchaseSummaryDto` exists (need to verify query/handler)

**Missing Components:**

#### 15a. Item-wise Sales Report ❌ MISSING
- **Application:** No `GetItemWiseSalesReportQuery`
- **API:** No endpoint
- **Angular:** No component

#### 15b. Purchase Summary Report ❌ INCOMPLETE
- **Application:** DTO exists, but need to verify if query/handler exists
- **API:** Need to verify endpoint
- **Angular:** Need to verify component

#### 15c. Low Stock Report ❌ MISSING
- **Application:** No dedicated low stock report query (may use existing low stock list)
- **API:** Need dedicated report endpoint
- **Angular:** Need report component

#### 15d. Expiry Report ❌ MISSING
- **Application:** No expiry report query
- **API:** No endpoint
- **Angular:** No component

**What Needs to Be Built:**
- `GetItemWiseSalesReportQuery` (sales by product, date range)
- `GetLowStockReportQuery` (if not using existing list)
- `GetExpiryReportQuery` (products expiring in next N days)
- Verify `GetPurchaseSummaryQuery` exists, if not create it
- API endpoints for all missing reports
- Angular components for all missing reports

---

## TASK 2 — IMPLEMENTATION PLAN

### Feature 1: Sales Return / Refund

**Files to Create:**
- `src/Domain/GroceryStoreManagement.Domain/Entities/SaleReturn.cs`
- `src/Domain/GroceryStoreManagement.Domain/Entities/Refund.cs`
- `src/Domain/GroceryStoreManagement.Domain/Enums/ReturnStatus.cs`
- `src/Application/GroceryStoreManagement.Application/DTOs/SaleReturnDto.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/Sales/CreateSaleReturnCommand.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/Sales/CreateSaleReturnCommandHandler.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/Sales/ProcessRefundCommand.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/Sales/ProcessRefundCommandHandler.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Sales/GetSaleReturnsQuery.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Sales/GetSaleReturnsQueryHandler.cs`
- `src/Infrastructure/GroceryStoreManagement.Infrastructure/Persistence/Configurations/SaleReturnConfiguration.cs`
- `src/API/GroceryStoreManagement.API/Controllers/SaleReturnsController.cs`
- `frontend/src/app/admin/features/sales/sale-return-form/sale-return-form.component.ts`
- `frontend/src/app/admin/features/sales/refund-processing/refund-processing.component.ts`
- `frontend/src/app/core/services/sale-return.service.ts`

**Files to Update:**
- `src/Infrastructure/GroceryStoreManagement.Infrastructure/Persistence/ApplicationDbContext.cs` (add DbSet)
- `frontend/src/app/admin/features/sales/sales.routes.ts` (add routes)

**API Endpoints:**
- `POST /api/sales/{saleId}/returns` - Create return
- `POST /api/sales/returns/{returnId}/refund` - Process refund
- `GET /api/sales/returns` - List returns
- `GET /api/sales/returns/{id}` - Get return details

---

### Feature 2: Supplier Return (Complete API/UI)

**Files to Create:**
- `src/Application/GroceryStoreManagement.Application/Commands/Purchasing/CreateSupplierReturnCommand.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/Purchasing/CreateSupplierReturnCommandHandler.cs`
- `src/Application/GroceryStoreManagement.Application/DTOs/SupplierReturnDto.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Purchasing/GetSupplierReturnsQuery.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Purchasing/GetSupplierReturnsQueryHandler.cs`
- `frontend/src/app/admin/features/purchasing/supplier-return-form/supplier-return-form.component.ts`
- `frontend/src/app/admin/features/purchasing/supplier-returns-list/supplier-returns-list.component.ts`
- `frontend/src/app/core/services/supplier-return.service.ts`

**Files to Update:**
- `src/API/GroceryStoreManagement.API/Controllers/PurchasingController.cs` (add endpoints)
- `frontend/src/app/admin/features/purchasing/purchasing.routes.ts` (add routes)

**API Endpoints:**
- `POST /api/purchasing/supplier-returns` - Create supplier return
- `GET /api/purchasing/supplier-returns` - List supplier returns
- `GET /api/purchasing/supplier-returns/{id}` - Get supplier return details

---

### Feature 3: Basic Offline POS

**Files to Create:**
- `frontend/src/app/core/services/offline-storage.service.ts` (IndexedDB wrapper)
- `frontend/src/app/core/services/sync-queue.service.ts`
- `frontend/src/app/client/shared/components/offline-indicator/offline-indicator.component.ts`
- `src/Application/GroceryStoreManagement.Application/Commands/Sync/SyncOfflineSalesCommand.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/Sync/SyncOfflineSalesCommandHandler.cs`
- `src/API/GroceryStoreManagement.API/Controllers/SyncController.cs`

**Files to Update:**
- `frontend/src/app/client/features/pos/pos.component.ts` (add offline detection, save to IndexedDB)
- `frontend/src/app/core/services/sale.service.ts` (add offline mode handling)
- `package.json` (add `idb` package)

**API Endpoints:**
- `POST /api/sync/offline-sales` - Sync offline sales
- `GET /api/sync/status` - Get sync status

---

### Feature 4: Weight Machine Integration

**Files to Create:**
- `src/Application/GroceryStoreManagement.Application/Interfaces/IWeightScaleService.cs`
- `src/Infrastructure/GroceryStoreManagement.Infrastructure/Services/WeightScaleService.cs`
- `src/API/GroceryStoreManagement.API/Controllers/WeightScaleController.cs`
- `frontend/src/app/core/services/weight-scale.service.ts`

**Files to Update:**
- `frontend/src/app/client/features/pos/pos.component.ts` (add weight input for weight-based products)

**API Endpoints:**
- `GET /api/weight-scale/read` - Read current weight
- `POST /api/weight-scale/tare` - Tare the scale
- `GET /api/weight-scale/status` - Get connection status

---

### Feature 5: Thermal Receipt Printing

**Files to Create:**
- `src/Application/GroceryStoreManagement.Application/Interfaces/IReceiptPrinterService.cs`
- `src/Infrastructure/GroceryStoreManagement.Infrastructure/Services/ReceiptPrinterService.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/Print/PrintReceiptCommand.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/Print/PrintReceiptCommandHandler.cs`
- `src/API/GroceryStoreManagement.API/Controllers/PrintController.cs`
- `frontend/src/app/core/services/receipt-printer.service.ts`

**Files to Update:**
- `frontend/src/app/admin/features/sales/sale-details/sale-details.component.ts` (add print button)

**API Endpoints:**
- `POST /api/print/receipt` - Print receipt (sale ID)

---

### Feature 6: Supplier Payment Tracking

**Files to Create:**
- `src/Domain/GroceryStoreManagement.Domain/Entities/SupplierPayment.cs`
- `src/Application/GroceryStoreManagement.Application/DTOs/SupplierPaymentDto.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/Suppliers/CreateSupplierPaymentCommand.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/Suppliers/CreateSupplierPaymentCommandHandler.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Suppliers/GetOutstandingPaymentsQuery.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Suppliers/GetOutstandingPaymentsQueryHandler.cs`
- `src/Infrastructure/GroceryStoreManagement.Infrastructure/Persistence/Configurations/SupplierPaymentConfiguration.cs`
- `src/API/GroceryStoreManagement.API/Controllers/SupplierPaymentsController.cs`
- `frontend/src/app/admin/features/suppliers/supplier-payments/supplier-payments.component.ts`
- `frontend/src/app/core/services/supplier-payment.service.ts`

**Files to Update:**
- `src/Infrastructure/GroceryStoreManagement.Infrastructure/Persistence/ApplicationDbContext.cs` (add DbSet)

**API Endpoints:**
- `POST /api/suppliers/{id}/payments` - Record payment
- `GET /api/suppliers/{id}/outstanding` - Get outstanding amount
- `GET /api/suppliers/{id}/payments` - List payments

---

### Feature 7: GST Compliance (GSTR-1, GSTR-2)

**Files to Create:**
- `src/Application/GroceryStoreManagement.Application/Interfaces/IGSTExportService.cs`
- `src/Infrastructure/GroceryStoreManagement.Infrastructure/Services/GSTExportService.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/GST/ExportGSTR1Command.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/GST/ExportGSTR1CommandHandler.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/GST/ExportGSTR2Command.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/GST/ExportGSTR2CommandHandler.cs`
- `src/API/GroceryStoreManagement.API/Controllers/GSTController.cs`
- `frontend/src/app/admin/features/reports/gst-export/gst-export.component.ts`
- `frontend/src/app/core/services/gst-export.service.ts`

**Files to Update:**
- `frontend/src/app/admin/features/reports/reports.routes.ts` (add route)

**API Endpoints:**
- `GET /api/gst/gstr1?fromDate&toDate` - Export GSTR-1 (CSV/Excel)
- `GET /api/gst/gstr2?fromDate&toDate` - Export GSTR-2 (CSV/Excel)

---

### Feature 8: Role-based Permissions

**Files to Create:**
- `src/Domain/GroceryStoreManagement.Domain/Entities/Permission.cs`
- `src/Domain/GroceryStoreManagement.Domain/Entities/RolePermission.cs`
- `src/Application/GroceryStoreManagement.Application/Interfaces/IPermissionService.cs`
- `src/Application/GroceryStoreManagement.Application/Services/PermissionService.cs`
- `src/Application/GroceryStoreManagement.Application/DTOs/PermissionDto.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/Permissions/AssignPermissionCommand.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Permissions/GetUserPermissionsQuery.cs`
- `src/Infrastructure/GroceryStoreManagement.Infrastructure/Persistence/Configurations/PermissionConfiguration.cs`
- `src/API/GroceryStoreManagement.API/Attributes/RequirePermissionAttribute.cs`
- `src/API/GroceryStoreManagement.API/Controllers/PermissionsController.cs`
- `frontend/src/app/core/services/permission.service.ts`
- `frontend/src/app/core/auth/permission.guard.ts`
- `frontend/src/app/admin/features/settings/permissions/permissions.component.ts`

**Files to Update:**
- `src/Infrastructure/GroceryStoreManagement.Infrastructure/Persistence/ApplicationDbContext.cs` (add DbSets)
- Controllers (add `[RequirePermission]` attributes where needed)

**API Endpoints:**
- `GET /api/permissions` - List all permissions
- `POST /api/roles/{roleId}/permissions` - Assign permissions to role
- `GET /api/users/{userId}/permissions` - Get user permissions

---

### Feature 9: Reorder Points

**Files to Create:**
- `src/Application/GroceryStoreManagement.Application/Commands/Products/UpdateReorderPointCommand.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/Products/UpdateReorderPointCommandHandler.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Inventory/GetReorderSuggestionsQuery.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Inventory/GetReorderSuggestionsQueryHandler.cs`
- `src/Application/GroceryStoreManagement.Application/DTOs/ReorderSuggestionDto.cs`
- `src/API/GroceryStoreManagement.API/Controllers/InventoryController.cs` (add endpoint)
- `frontend/src/app/admin/features/inventory/reorder-suggestions/reorder-suggestions.component.ts`
- `frontend/src/app/core/services/reorder.service.ts`

**Files to Update:**
- `src/Domain/GroceryStoreManagement.Domain/Entities/Product.cs` (add ReorderPoint, SuggestedReorderQuantity properties)
- `src/Application/GroceryStoreManagement.Application/DTOs/ProductDto.cs` (add properties)
- `frontend/src/app/admin/features/products/product-form/product-form.component.ts` (add fields)

**API Endpoints:**
- `PUT /api/products/{id}/reorder-point` - Update reorder point
- `GET /api/inventory/reorder-suggestions` - Get reorder suggestions

---

### Feature 10: Slow-Moving Products Report

**Files to Create:**
- `src/Application/GroceryStoreManagement.Application/Queries/Reports/GetSlowMovingProductsQuery.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Reports/GetSlowMovingProductsQueryHandler.cs`
- `src/Application/GroceryStoreManagement.Application/DTOs/SlowMovingProductsReportDto.cs`
- `frontend/src/app/admin/features/reports/slow-moving/slow-moving.component.ts`

**Files to Update:**
- `src/API/GroceryStoreManagement.API/Controllers/ReportsController.cs` (add endpoint)
- `frontend/src/app/admin/features/reports/reports.routes.ts` (add route)

**API Endpoints:**
- `GET /api/reports/slow-moving?days=90&minDaysSinceLastSale=30` - Get slow-moving products

---

### Feature 11: Barcode Printing

**Files to Create:**
- `src/Application/GroceryStoreManagement.Application/Interfaces/IBarcodePrintService.cs`
- `src/Infrastructure/GroceryStoreManagement.Infrastructure/Services/BarcodePrintService.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/Print/PrintBarcodeCommand.cs`
- `src/Application/GroceryStoreManagement.Application/Commands/Print/PrintBarcodeCommandHandler.cs`
- `src/API/GroceryStoreManagement.API/Controllers/PrintController.cs` (add barcode endpoint)
- `frontend/src/app/core/services/barcode-print.service.ts`
- `frontend/src/app/admin/features/products/product-details/product-details.component.ts` (add print button)

**API Endpoints:**
- `POST /api/print/barcode` - Print barcode (product ID, quantity)

---

### Feature 12: Basic Data Validation

**Files to Update:**
- `src/Application/GroceryStoreManagement.Application/Commands/Sales/CreatePOSSaleCommandHandler.cs` (add sale price >= cost validation)
- `src/Application/GroceryStoreManagement.Application/Commands/Sales/CreatePOSSaleCommand.cs` (add AllowPriceOverride flag)
- `src/Infrastructure/GroceryStoreManagement.Infrastructure/Persistence/SeedData.cs` (if needed)

**No new files needed, just enhance existing validation**

---

### Feature 13: Basic Notifications ✅ COMPLETE

**No action needed**

---

### Feature 14: Inventory Adjustment

**Files to Verify/Create:**
- Check if `CreateInventoryAdjustmentCommand` exists
- Check if `GetInventoryAdjustmentsQuery` exists
- Check if API endpoints exist in `AdminInventoryController`
- Check if Angular component exists

**If missing, create:**
- `src/Application/GroceryStoreManagement.Application/Commands/Inventory/CreateInventoryAdjustmentCommand.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Inventory/GetInventoryAdjustmentsQuery.cs`
- `frontend/src/app/admin/features/adjustments/adjustment-form/adjustment-form.component.ts` (may already exist)

---

### Feature 15: Essential Reports

**Files to Create:**

#### 15a. Item-wise Sales Report
- `src/Application/GroceryStoreManagement.Application/Queries/Reports/GetItemWiseSalesReportQuery.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Reports/GetItemWiseSalesReportQueryHandler.cs`
- `src/Application/GroceryStoreManagement.Application/DTOs/ItemWiseSalesReportDto.cs`
- `frontend/src/app/admin/features/reports/item-wise-sales/item-wise-sales.component.ts`

#### 15b. Purchase Summary Report
- Verify if query exists, if not create:
- `src/Application/GroceryStoreManagement.Application/Queries/Reports/GetPurchaseSummaryQuery.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Reports/GetPurchaseSummaryQueryHandler.cs`
- `frontend/src/app/admin/features/reports/purchase-summary/purchase-summary.component.ts`

#### 15c. Low Stock Report
- `src/Application/GroceryStoreManagement.Application/Queries/Reports/GetLowStockReportQuery.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Reports/GetLowStockReportQueryHandler.cs`
- `src/Application/GroceryStoreManagement.Application/DTOs/LowStockReportDto.cs`
- `frontend/src/app/admin/features/reports/low-stock/low-stock.component.ts`

#### 15d. Expiry Report
- `src/Application/GroceryStoreManagement.Application/Queries/Reports/GetExpiryReportQuery.cs`
- `src/Application/GroceryStoreManagement.Application/Queries/Reports/GetExpiryReportQueryHandler.cs`
- `src/Application/GroceryStoreManagement.Application/DTOs/ExpiryReportDto.cs`
- `frontend/src/app/admin/features/reports/expiry/expiry.component.ts`

**Files to Update:**
- `src/API/GroceryStoreManagement.API/Controllers/ReportsController.cs` (add all endpoints)
- `frontend/src/app/admin/features/reports/reports.routes.ts` (add routes)

**API Endpoints:**
- `GET /api/reports/item-wise-sales?startDate&endDate` - Item-wise sales
- `GET /api/reports/purchase-summary?startDate&endDate` - Purchase summary
- `GET /api/reports/low-stock` - Low stock report
- `GET /api/reports/expiry?days=30` - Expiry report

---

## TASK 3 — STEP-BY-STEP TASK LIST FOR CURSOR

### Phase 1: Sales Return / Refund (Tasks 1-15)

1. Create `ReturnStatus` enum in `src/Domain/GroceryStoreManagement.Domain/Enums/ReturnStatus.cs`
2. Create `SaleReturn` entity in `src/Domain/GroceryStoreManagement.Domain/Entities/SaleReturn.cs`
3. Create `Refund` entity in `src/Domain/GroceryStoreManagement.Domain/Entities/Refund.cs`
4. Create `SaleReturnDto` in `src/Application/GroceryStoreManagement.Application/DTOs/SaleReturnDto.cs`
5. Create `CreateSaleReturnCommand` in `src/Application/GroceryStoreManagement.Application/Commands/Sales/CreateSaleReturnCommand.cs`
6. Create `CreateSaleReturnCommandHandler` in `src/Application/GroceryStoreManagement.Application/Commands/Sales/CreateSaleReturnCommandHandler.cs`
7. Create `ProcessRefundCommand` in `src/Application/GroceryStoreManagement.Application/Commands/Sales/ProcessRefundCommand.cs`
8. Create `ProcessRefundCommandHandler` in `src/Application/GroceryStoreManagement.Application/Commands/Sales/ProcessRefundCommandHandler.cs`
9. Create `GetSaleReturnsQuery` in `src/Application/GroceryStoreManagement.Application/Queries/Sales/GetSaleReturnsQuery.cs`
10. Create `GetSaleReturnsQueryHandler` in `src/Application/GroceryStoreManagement.Application/Queries/Sales/GetSaleReturnsQueryHandler.cs`
11. Create `SaleReturnConfiguration` in `src/Infrastructure/GroceryStoreManagement.Infrastructure/Persistence/Configurations/SaleReturnConfiguration.cs`
12. Update `ApplicationDbContext.cs` to add `DbSet<SaleReturn>` and `DbSet<Refund>`
13. Create `SaleReturnsController` in `src/API/GroceryStoreManagement.API/Controllers/SaleReturnsController.cs`
14. Create Angular service `sale-return.service.ts` in `frontend/src/app/core/services/sale-return.service.ts`
15. Create Angular component `sale-return-form.component.ts` in `frontend/src/app/admin/features/sales/sale-return-form/`

---

### Phase 2: Supplier Return API/UI (Tasks 16-22)

16. Create `SupplierReturnDto` in `src/Application/GroceryStoreManagement.Application/DTOs/SupplierReturnDto.cs`
17. Create `CreateSupplierReturnCommand` in `src/Application/GroceryStoreManagement.Application/Commands/Purchasing/CreateSupplierReturnCommand.cs`
18. Create `CreateSupplierReturnCommandHandler` in `src/Application/GroceryStoreManagement.Application/Commands/Purchasing/CreateSupplierReturnCommandHandler.cs`
19. Create `GetSupplierReturnsQuery` in `src/Application/GroceryStoreManagement.Application/Queries/Purchasing/GetSupplierReturnsQuery.cs`
20. Create `GetSupplierReturnsQueryHandler` in `src/Application/GroceryStoreManagement.Application/Queries/Purchasing/GetSupplierReturnsQueryHandler.cs`
21. Add supplier return endpoints to `PurchasingController.cs`
22. Create Angular component `supplier-return-form.component.ts` in `frontend/src/app/admin/features/purchasing/supplier-return-form/`

---

### Phase 3: Offline POS (Tasks 23-30)

23. Install `idb` package: `npm install idb` in frontend
24. Create `offline-storage.service.ts` in `frontend/src/app/core/services/offline-storage.service.ts`
25. Create `sync-queue.service.ts` in `frontend/src/app/core/services/sync-queue.service.ts`
26. Create `offline-indicator.component.ts` in `frontend/src/app/client/shared/components/offline-indicator/`
27. Create `SyncOfflineSalesCommand` in `src/Application/GroceryStoreManagement.Application/Commands/Sync/SyncOfflineSalesCommand.cs`
28. Create `SyncOfflineSalesCommandHandler` in `src/Application/GroceryStoreManagement.Application/Commands/Sync/SyncOfflineSalesCommandHandler.cs`
29. Create `SyncController` in `src/API/GroceryStoreManagement.API/Controllers/SyncController.cs`
30. Update `pos.component.ts` to detect offline and save to IndexedDB

---

### Phase 4: Weight Machine Integration (Tasks 31-36)

31. Create `IWeightScaleService` interface in `src/Application/GroceryStoreManagement.Application/Interfaces/IWeightScaleService.cs`
32. Create `WeightScaleService` implementation in `src/Infrastructure/GroceryStoreManagement.Infrastructure/Services/WeightScaleService.cs`
33. Create `WeightScaleController` in `src/API/GroceryStoreManagement.API/Controllers/WeightScaleController.cs`
34. Create Angular `weight-scale.service.ts` in `frontend/src/app/core/services/weight-scale.service.ts`
35. Update `pos.component.ts` to show weight input for weight-based products
36. Add weight scale API call when scanning weight-based product

---

### Phase 5: Thermal Receipt Printing (Tasks 37-42)

37. Create `IReceiptPrinterService` interface in `src/Application/GroceryStoreManagement.Application/Interfaces/IReceiptPrinterService.cs`
38. Create `ReceiptPrinterService` implementation in `src/Infrastructure/GroceryStoreManagement.Infrastructure/Services/ReceiptPrinterService.cs`
39. Create `PrintReceiptCommand` in `src/Application/GroceryStoreManagement.Application/Commands/Print/PrintReceiptCommand.cs`
40. Create `PrintReceiptCommandHandler` in `src/Application/GroceryStoreManagement.Application/Commands/Print/PrintReceiptCommandHandler.cs`
41. Create `PrintController` in `src/API/GroceryStoreManagement.API/Controllers/PrintController.cs`
42. Create Angular `receipt-printer.service.ts` and add print button to sale details

---

### Phase 6: Supplier Payment Tracking (Tasks 43-50)

43. Create `SupplierPayment` entity in `src/Domain/GroceryStoreManagement.Domain/Entities/SupplierPayment.cs`
44. Create `SupplierPaymentDto` in `src/Application/GroceryStoreManagement.Application/DTOs/SupplierPaymentDto.cs`
45. Create `CreateSupplierPaymentCommand` in `src/Application/GroceryStoreManagement.Application/Commands/Suppliers/CreateSupplierPaymentCommand.cs`
46. Create `CreateSupplierPaymentCommandHandler` in `src/Application/GroceryStoreManagement.Application/Commands/Suppliers/CreateSupplierPaymentCommandHandler.cs`
47. Create `GetOutstandingPaymentsQuery` in `src/Application/GroceryStoreManagement.Application/Queries/Suppliers/GetOutstandingPaymentsQuery.cs`
48. Create `GetOutstandingPaymentsQueryHandler` in `src/Application/GroceryStoreManagement.Application/Queries/Suppliers/GetOutstandingPaymentsQueryHandler.cs`
49. Create `SupplierPaymentConfiguration` and update `ApplicationDbContext.cs`
50. Create `SupplierPaymentsController` and Angular components

---

### Phase 7: GST Compliance (Tasks 51-57)

51. Create `IGSTExportService` interface in `src/Application/GroceryStoreManagement.Application/Interfaces/IGSTExportService.cs`
52. Create `GSTExportService` implementation in `src/Infrastructure/GroceryStoreManagement.Infrastructure/Services/GSTExportService.cs`
53. Create `ExportGSTR1Command` and handler
54. Create `ExportGSTR2Command` and handler
55. Create `GSTController` in `src/API/GroceryStoreManagement.API/Controllers/GSTController.cs`
56. Create Angular `gst-export.service.ts` in `frontend/src/app/core/services/gst-export.service.ts`
57. Create Angular `gst-export.component.ts` in `frontend/src/app/admin/features/reports/gst-export/`

---

### Phase 8: Role-based Permissions (Tasks 58-68)

58. Create `Permission` entity in `src/Domain/GroceryStoreManagement.Domain/Entities/Permission.cs`
59. Create `RolePermission` entity in `src/Domain/GroceryStoreManagement.Domain/Entities/RolePermission.cs`
60. Create `IPermissionService` interface
61. Create `PermissionService` implementation
62. Create `PermissionDto` and related DTOs
63. Create `AssignPermissionCommand` and handler
64. Create `GetUserPermissionsQuery` and handler
65. Create `RequirePermissionAttribute` in `src/API/GroceryStoreManagement.API/Attributes/RequirePermissionAttribute.cs`
66. Create `PermissionsController`
67. Create Angular `permission.service.ts` and `permission.guard.ts`
68. Create Angular `permissions.component.ts` for permission management UI

---

### Phase 9: Reorder Points (Tasks 69-75)

69. Update `Product.cs` entity to add `ReorderPoint` and `SuggestedReorderQuantity` properties
70. Update `ProductDto.cs` to include new properties
71. Create `UpdateReorderPointCommand` and handler
72. Create `GetReorderSuggestionsQuery` and handler
73. Create `ReorderSuggestionDto`
74. Add reorder point endpoint to `InventoryController.cs`
75. Update Angular product form and create reorder suggestions component

---

### Phase 10: Slow-Moving Products Report (Tasks 76-79)

76. Create `GetSlowMovingProductsQuery` in `src/Application/GroceryStoreManagement.Application/Queries/Reports/GetSlowMovingProductsQuery.cs`
77. Create `GetSlowMovingProductsQueryHandler` in `src/Application/GroceryStoreManagement.Application/Queries/Reports/GetSlowMovingProductsQueryHandler.cs`
78. Create `SlowMovingProductsReportDto` in `src/Application/GroceryStoreManagement.Application/DTOs/SlowMovingProductsReportDto.cs`
79. Add endpoint to `ReportsController.cs` and create Angular component

---

### Phase 11: Barcode Printing (Tasks 80-85)

80. Create `IBarcodePrintService` interface in `src/Application/GroceryStoreManagement.Application/Interfaces/IBarcodePrintService.cs`
81. Create `BarcodePrintService` implementation in `src/Infrastructure/GroceryStoreManagement.Infrastructure/Services/BarcodePrintService.cs`
82. Create `PrintBarcodeCommand` and handler
83. Add barcode print endpoint to `PrintController.cs`
84. Create Angular `barcode-print.service.ts`
85. Add print button to product details component

---

### Phase 12: Basic Data Validation (Tasks 86-87)

86. Update `CreatePOSSaleCommandHandler.cs` to validate sale price >= cost (with override flag)
87. Add configuration for strict negative stock prevention (optional)

---

### Phase 13: Basic Notifications ✅ COMPLETE

**No tasks needed**

---

### Phase 14: Inventory Adjustment (Tasks 88-90)

88. Verify if `CreateInventoryAdjustmentCommand` exists, if not create it
89. Verify if API endpoints exist, if not add to `AdminInventoryController.cs`
90. Verify if Angular component exists, if not create `adjustment-form.component.ts`

---

### Phase 15: Essential Reports (Tasks 91-98)

91. Create `GetItemWiseSalesReportQuery` and handler
92. Create `ItemWiseSalesReportDto`
93. Verify `GetPurchaseSummaryQuery` exists, if not create it
94. Create `GetLowStockReportQuery` and handler
95. Create `GetExpiryReportQuery` and handler
96. Add all report endpoints to `ReportsController.cs`
97. Create Angular components for all missing reports
98. Update reports routes in Angular

---

## SUMMARY

**Total Tasks:** 98 implementation tasks  
**Organized into:** 15 phases (one per feature)  
**Approach:** Incremental, non-destructive additions  
**Estimated Time:** 10-12 weeks (2.5-3 months) for all features

**Priority Order:**
1. Sales Return / Refund (critical for customer satisfaction)
2. Supplier Return (complete existing feature)
3. Basic Data Validation (data integrity)
4. Essential Reports (business intelligence)
5. Offline POS (business continuity)
6. Remaining features in order listed

---

**Next Steps:**
1. Review this gap analysis
2. Approve the implementation plan
3. Start with Phase 1 (Sales Return) or your preferred priority
4. Implement one task at a time, test after each


