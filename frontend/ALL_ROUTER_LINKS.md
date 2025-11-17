# Complete Router Links - All Components Available

## 🔗 Quick Access Links

### ✅ Active Production Routes

#### Authentication
- `/login` - LoginComponent (features/auth/login)

#### Admin Dashboard
- `/admin` - AdminLayoutComponent (redirects to dashboard)
- `/admin/dashboard` - DashboardComponent

#### Products
- `/admin/products` - ProductListComponent
- `/admin/products/new` - ProductCreateComponent
- `/admin/products/edit/:id` - ProductFormComponent
- `/admin/products/:id` - ProductDetailsComponent

#### Imports
- `/admin/imports` - ImportPageComponent
- `/admin/imports/jobs` - ImportJobsListComponent
- `/admin/imports/jobs/:id` - ImportJobDetailsComponent

#### Inventory
- `/inventory` - InventoryDashboardComponent
- `/inventory/products` - ProductBatchListComponent
- `/inventory/product/:productId` - BatchDetailsComponent
- `/inventory/product/:productId/batches` - BatchDetailsComponent
- `/inventory/low-stock` - LowStockListComponent
- `/inventory/expiry` - ExpiryListComponent
- `/inventory/expiry-management` - ExpiryManagementComponent ⚠️ NEW
- `/inventory/adjust` - InventoryAdjustComponent
- `/inventory/list` - InventoryListComponent

#### Purchasing
- `/purchasing/purchase-orders` - PurchaseOrderListComponent
- `/purchasing/purchase-orders/new` - PurchaseOrderFormComponent
- `/purchasing/purchase-orders/:id` - PurchaseOrderDetailsComponent
- `/purchasing/purchase-orders/:id/edit` - PurchaseOrderFormComponent
- `/purchasing/grn` - GRNListComponent
- `/purchasing/grn/new` - GRNFormComponent
- `/purchasing/grn/:id` - GRNDetailsComponent
- `/purchasing/grn/:id/confirm` - GRNConfirmComponent

#### Adjustments
- `/inventory/adjustments` - AdjustmentHistoryComponent
- `/inventory/adjustments/new` - AdjustmentFormComponent

#### Sales
- `/admin/sales` - SalesListComponent
- `/admin/sales/:id` - SaleDetailsComponent

#### Customers
- `/admin/customers` - CustomersListComponent
- `/admin/customers/:id` - CustomerDetailsComponent

#### Reports
- `/reports` - ReportsComponent
- `/reports/daily-sales` - DailySalesComponent
- `/reports/gst-summary` - GstSummaryComponent
- `/reports/fast-moving` - FastMovingComponent

#### Settings
- `/settings` - StoreSettingsComponent
- `/settings/roles` - RolesPermissionsComponent

#### Audit
- `/admin/audit` - AuditLogsComponent

#### POS
- `/pos` - KioskComponent
- `/pos/kiosk` - KioskComponent
- `/pos/assisted` - AssistedPosComponent

---

### ⚠️ Legacy Components (For Review - Marked for Deletion)

These routes are added temporarily so you can compare and decide what to keep:

- `/pos/legacy` - PosComponent (legacy, use `/pos` instead)
- `/admin/imports/legacy-upload` - ImportUploadComponent (legacy, use `/admin/imports` instead)
- `/login/legacy` - LoginComponent (duplicate, use `/login` instead)

---

## 📊 Component Status Summary

### ✅ Routed & Active (40+ routes)
All components listed above under "Active Production Routes"

### ⚠️ Legacy/Duplicate Components (3 routes)
- `PosComponent` - Legacy POS (in `pos/` folder)
- `ImportUploadComponent` - Legacy import (in `admin/imports/`)
- `LoginComponent` - Duplicate (in `auth/login/`)

### 🔍 Components Not Routed (Shared/Modal Components)
These are used by other components, not directly routed:

**Shared Components:**
- `ProductTileComponent` - Used in POS
- `QuantityPickerComponent` - Used in forms
- `BarcodeInputComponent` - Used in POS
- `CategoryMultiselectComponent` - Used in filters
- `ConfirmDialogComponent` - Modal component
- `FileUploadComponent` - Used in imports
- `FileImportComponent` - Used in imports
- `ImagePreviewComponent` - Used in forms
- `ProgressBarComponent` - Used in imports
- `ColumnMappingComponent` - Used in imports
- `ToastComponent` - Service-based notification
- `CategoryCreateModalComponent` - Modal component

**Kiosk Sub-Components:**
- `ProductTilesComponent` - Used in kiosk
- `CategoryNavComponent` - Used in kiosk
- `SearchBarComponent` - Used in kiosk
- `VoiceCommandButtonComponent` - Used in kiosk
- `CartPanelComponent` - Used in kiosk
- `CheckoutModalComponent` - Modal component

---

## 🎯 Decision Matrix

### Components to Review for Deletion:

1. **`PosComponent` (legacy)**
   - Route: `/pos/legacy`
   - Location: `pos/pos.component.*`
   - Replacement: `KioskComponent` at `/pos`
   - **Action:** Delete if functionality migrated

2. **`ImportUploadComponent` (legacy)**
   - Route: `/admin/imports/legacy-upload`
   - Location: `admin/imports/import-upload.component.*`
   - Replacement: `ImportPageComponent` at `/admin/imports`
   - **Action:** Delete if functionality migrated

3. **`LoginComponent` (duplicate)**
   - Route: `/login/legacy`
   - Location: `auth/login/login.component.*`
   - Replacement: `LoginComponent` at `/login` (from `features/auth/login/`)
   - **Action:** Delete duplicate

### Components to Review for Merging:

1. **`InventoryAdjustComponent` vs `AdjustmentFormComponent`**
   - Routes: `/inventory/adjust` vs `/inventory/adjustments/new`
   - **Action:** Compare functionality, merge if duplicate

2. **`ExpiryListComponent` vs `ExpiryManagementComponent`**
   - Routes: `/inventory/expiry` vs `/inventory/expiry-management`
   - **Action:** Compare functionality, merge if duplicate

---

## 📝 Testing Checklist

To review all components:

1. ✅ Visit each route listed above
2. ✅ Compare legacy components with their replacements
3. ✅ Check for duplicate functionality
4. ✅ Verify all features work correctly
5. ✅ Delete unused/duplicate components
6. ✅ Update documentation

---

## 🔄 Next Steps

1. **Test all routes** - Visit each link to verify functionality
2. **Compare duplicates** - Check legacy vs new components
3. **Delete unused** - Remove components that are no longer needed
4. **Update routes** - Remove legacy routes after cleanup
5. **Update imports** - Fix any broken imports after deletion

