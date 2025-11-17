# Complete Router Links & Components Reference

## All Available Routes in the Application

### 🔐 Authentication Routes
| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/login` | `LoginComponent` | None | ✅ Active |
| `/` | Redirects to `/admin/dashboard` | None | ✅ Active |

---

### 👨‍💼 Admin Routes (`/admin/*`)
**Base Route:** `/admin` (Protected by `AdminGuard`)

#### Admin Layout & Dashboard
| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/admin` | `AdminLayoutComponent` (with children) | `AdminGuard` | ✅ Active |
| `/admin/dashboard` | `DashboardComponent` | `AdminGuard` | ✅ Active |

#### Products Management (`/admin/products/*`)
| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/admin/products` | `ProductListComponent` | `AdminGuard` | ✅ Active |
| `/admin/products/new` | `ProductCreateComponent` | `AdminGuard` | ✅ Active |
| `/admin/products/edit/:id` | `ProductFormComponent` | `AdminGuard` | ✅ Active |
| `/admin/products/:id` | `ProductDetailsComponent` | `AdminGuard` | ✅ Active |

#### Imports (`/admin/imports/*`)
| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/admin/imports` | `ImportPageComponent` | `AdminGuard` | ✅ Active |
| `/admin/imports/jobs` | `ImportJobsListComponent` | `AdminGuard` | ✅ Active |
| `/admin/imports/jobs/:id` | `ImportJobDetailsComponent` | `AdminGuard` | ✅ Active |

#### Inventory (`/admin/inventory/*` or `/inventory/*`)
| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/admin/inventory` | `InventoryDashboardComponent` | `AdminGuard` | ✅ Active |
| `/inventory` | `InventoryDashboardComponent` | `AuthGuard` | ✅ Active |
| `/inventory/products` | `ProductBatchListComponent` | `AuthGuard` | ✅ Active |
| `/inventory/product/:productId` | `BatchDetailsComponent` | `AuthGuard` | ✅ Active |
| `/inventory/product/:productId/batches` | `BatchDetailsComponent` | `AuthGuard` | ✅ Active |
| `/inventory/low-stock` | `LowStockListComponent` | `AuthGuard` | ✅ Active |
| `/inventory/expiry` | `ExpiryListComponent` | `AuthGuard` | ✅ Active |
| `/inventory/adjust` | `InventoryAdjustComponent` | `AuthGuard` | ✅ Active |
| `/inventory/list` | `InventoryListComponent` | `AuthGuard` | ✅ Active |

#### Sales (`/admin/sales/*`)
| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/admin/sales` | `SalesListComponent` | `AdminGuard` | ✅ Active |
| `/admin/sales/:id` | `SaleDetailsComponent` | `AdminGuard` | ✅ Active |

#### Customers (`/admin/customers/*`)
| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/admin/customers` | `CustomersListComponent` | `AdminGuard` | ✅ Active |
| `/admin/customers/:id` | `CustomerDetailsComponent` | `AdminGuard` | ✅ Active |

#### Reports (`/admin/reports/*` or `/reports/*`)
| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/admin/reports` | `ReportsComponent` | `AdminGuard` | ✅ Active |
| `/reports` | `ReportsComponent` | `AuthGuard` | ✅ Active |
| `/reports/daily-sales` | `DailySalesComponent` | `AuthGuard` | ✅ Active |
| `/reports/gst-summary` | `GstSummaryComponent` | `AuthGuard` | ✅ Active |
| `/reports/fast-moving` | `FastMovingComponent` | `AuthGuard` | ✅ Active |

#### Settings (`/admin/settings/*` or `/settings/*`)
| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/admin/settings` | `StoreSettingsComponent` | `AdminGuard` | ✅ Active |
| `/settings` | `StoreSettingsComponent` | `AuthGuard` | ✅ Active |
| `/settings/roles` | `RolesPermissionsComponent` | `AuthGuard` | ✅ Active |

---

### 📦 Purchasing Routes (`/purchasing/*`)
| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/purchasing/purchase-orders` | `PurchaseOrderListComponent` | `AuthGuard` | ✅ Active |
| `/purchasing/purchase-orders/new` | `PurchaseOrderFormComponent` | `AuthGuard` | ✅ Active |
| `/purchasing/purchase-orders/:id` | `PurchaseOrderDetailsComponent` | `AuthGuard` | ✅ Active |
| `/purchasing/purchase-orders/:id/edit` | `PurchaseOrderFormComponent` | `AuthGuard` | ✅ Active |
| `/purchasing/grn` | `GRNListComponent` | `AuthGuard` | ✅ Active |
| `/purchasing/grn/new` | `GRNFormComponent` | `AuthGuard` | ✅ Active |
| `/purchasing/grn/:id` | `GRNDetailsComponent` | `AuthGuard` | ✅ Active |
| `/purchasing/grn/:id/confirm` | `GRNConfirmComponent` | `AuthGuard` | ✅ Active |

---

### 🔧 Adjustments Routes (`/inventory/adjustments/*`)
| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/inventory/adjustments` | `AdjustmentHistoryComponent` | `AuthGuard` | ✅ Active |
| `/inventory/adjustments/new` | `AdjustmentFormComponent` | `AuthGuard` | ✅ Active |

---

### 📋 Audit Routes (`/admin/audit/*`)
| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/admin/audit` | `AuditLogsComponent` | `AuthGuard`, `AdminGuard` | ✅ Active |

---

### 🛒 POS Routes (`/pos/*`)
| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/pos` | `KioskComponent` | None | ✅ Active |
| `/pos/kiosk` | `KioskComponent` | None | ✅ Active |
| `/pos/assisted` | `AssistedPosComponent` | None | ✅ Active |

---

## ⚠️ Components NOT Currently Routed

### Inventory Components
- `ExpiryManagementComponent` - Not routed (may be duplicate of `ExpiryListComponent`)
- `InventoryAdjustComponent` - Routed at `/inventory/adjust` but may be duplicate of `AdjustmentFormComponent`

### Legacy Components (Not Routed)
- `PosComponent` (in `pos/` folder) - Legacy, should use `KioskComponent` instead
- `ImportUploadComponent` (in `admin/imports/`) - Legacy, replaced by `ImportPageComponent`

### Shared Components (Not Routed - Used by other components)
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
- `ToastComponent` - Service-based, not routed

### Kiosk Sub-Components (Not Routed - Used by KioskComponent)
- `ProductTilesComponent` - Used in kiosk
- `CategoryNavComponent` - Used in kiosk
- `SearchBarComponent` - Used in kiosk
- `VoiceCommandButtonComponent` - Used in kiosk
- `CartPanelComponent` - Used in kiosk
- `CheckoutModalComponent` - Modal component

### Product Components (Not Routed - Used by other components)
- `CategoryCreateModalComponent` - Modal component

---

## 🔄 Potential Duplicates to Review

### 1. Inventory Adjustments
- `/inventory/adjust` → `InventoryAdjustComponent`
- `/inventory/adjustments/new` → `AdjustmentFormComponent`
- **Action:** Check if these should be merged

### 2. Expiry Management
- `/inventory/expiry` → `ExpiryListComponent`
- `ExpiryManagementComponent` (not routed)
- **Action:** Check if `ExpiryManagementComponent` is needed or duplicate

### 3. POS Components
- `/pos` → `KioskComponent` (in `client/features/pos/kiosk/`)
- `PosComponent` (in `pos/` folder) - Legacy, not routed
- **Action:** Delete legacy `PosComponent` or migrate functionality

### 4. Import Components
- `/admin/imports` → `ImportPageComponent` (in `admin/features/admin/imports/`)
- `ImportUploadComponent` (in `admin/imports/`) - Legacy, not routed
- **Action:** Delete legacy `ImportUploadComponent`

### 5. Login Components
- `/login` → `LoginComponent` (in `features/auth/login/`)
- `LoginComponent` (in `auth/login/`) - Duplicate, not routed
- **Action:** Delete duplicate `auth/login/` folder

---

## 📊 Route Summary Statistics

- **Total Routes:** ~40+ routes
- **Protected by AdminGuard:** 15 routes
- **Protected by AuthGuard:** 25+ routes
- **Public Routes:** 4 routes (login, POS)
- **Components Not Routed:** 20+ (shared components, modals, sub-components)

---

## 🎯 Recommendations

1. **Delete Legacy Components:**
   - `pos/pos.component.*` (use `client/features/pos/kiosk/` instead)
   - `admin/imports/import-upload.component.*` (use `admin/features/admin/imports/` instead)
   - `auth/login/` (duplicate of `features/auth/login/`)

2. **Review Duplicates:**
   - `InventoryAdjustComponent` vs `AdjustmentFormComponent`
   - `ExpiryListComponent` vs `ExpiryManagementComponent`

3. **Consider Consolidating:**
   - Some routes are accessible via both `/admin/*` and direct paths (e.g., `/admin/inventory` and `/inventory`)
   - Decide on a single path convention

