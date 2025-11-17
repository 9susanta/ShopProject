# Project Structure

## Frontend Angular Application Structure

```
src/app/
├── admin/                          # Admin-specific components and shared resources
│   ├── features/                   # All admin feature modules
│   │   ├── admin/                  # Main admin module
│   │   │   ├── admin-layout/      # Admin layout component
│   │   │   ├── dashboard/         # Admin dashboard
│   │   │   ├── imports/           # Product import functionality
│   │   │   ├── products/          # Product management
│   │   │   └── shared/            # Admin-specific shared styles
│   │   ├── adjustments/            # Inventory adjustments
│   │   ├── audit/                 # Audit logs
│   │   ├── customers/             # Customer management
│   │   ├── inventory/             # Inventory management
│   │   ├── purchasing/             # Purchase orders & GRN
│   │   ├── reports/               # Sales reports
│   │   ├── sales/                 # Sales management
│   │   └── settings/               # System settings
│   ├── imports/                    # Legacy imports (to be cleaned up)
│   └── shared/                     # Admin shared components
│       └── admin-header/          # Admin header component (moved here)
│
├── client/                         # Client-facing features
│   └── features/
│       └── pos/                   # Point of Sale
│           ├── assisted/          # Assisted POS
│           └── kiosk/             # Kiosk POS with components
│
├── core/                           # Core application infrastructure
│   ├── api/                       # API service
│   ├── auth/                      # Authentication guards & interceptors
│   ├── cache/                     # Caching service
│   ├── error/                     # Error handling
│   ├── guards/                    # Route guards
│   ├── interceptors/              # HTTP interceptors
│   ├── models/                    # TypeScript models/interfaces
│   ├── services/                   # Core services (auth, SignalR, etc.)
│   └── toast/                     # Toast notification service
│
├── features/                       # Legacy features (auth only)
│   └── auth/
│       └── login/                 # Login component
│
├── pos/                            # Legacy POS component (to be migrated)
│   ├── pos.component.ts
│   ├── pos.component.html
│   ├── pos.component.css
│   └── pos.service.ts
│
├── shared/                         # Shared components and UI
│   ├── components/                # Reusable components
│   │   ├── barcode-input/
│   │   ├── category-multiselect/
│   │   ├── column-mapping/
│   │   ├── confirm-dialog/
│   │   ├── file-import/
│   │   ├── file-upload/
│   │   ├── image-preview/
│   │   ├── product-tile/
│   │   ├── progress-bar/
│   │   └── quantity-picker/
│   └── ui/
│       └── toast/                 # Toast UI component
│
├── auth/                           # Legacy auth (duplicate of features/auth)
│   └── login/
│
├── app.component.ts                # Root component
├── app.config.ts                  # Application configuration
└── app.routes.ts                   # Main routing configuration
```

## Key Organization Principles

### 1. **Admin Features** (`admin/features/`)
All admin-related modules are organized under `admin/features/`:
- **admin/** - Main admin module (dashboard, products, imports)
- **inventory/** - Inventory management
- **purchasing/** - Purchase orders and GRN
- **adjustments/** - Inventory adjustments
- **audit/** - Audit logs
- **reports/** - Sales reports
- **sales/** - Sales management
- **customers/** - Customer management
- **settings/** - System settings

### 2. **Client Features** (`client/features/`)
Client-facing features:
- **pos/** - Point of Sale system (kiosk and assisted modes)

### 3. **Shared Resources**
- **admin/shared/** - Admin-specific shared components (admin-header)
- **shared/** - Application-wide shared components

### 4. **Core Infrastructure** (`core/`)
- Services, models, guards, interceptors
- Authentication and authorization
- API communication
- Error handling

## Route Structure

```
/ → /admin/dashboard (redirect)
/login → LoginComponent
/admin → AdminLayoutComponent (with AdminGuard)
  ├── /admin/dashboard → DashboardComponent
  ├── /admin/products → ProductRoutes
  ├── /admin/imports → ImportRoutes
  ├── /admin/inventory → InventoryRoutes
  ├── /admin/sales → SalesRoutes
  ├── /admin/customers → CustomersRoutes
  ├── /admin/reports → ReportsRoutes
  └── /admin/settings → SettingsRoutes
/inventory → InventoryRoutes (with AuthGuard)
/purchasing → PurchasingRoutes (with AuthGuard)
/reports → ReportsRoutes (with AuthGuard)
/settings → SettingsRoutes (with AuthGuard)
/inventory/adjustments → AdjustmentsRoutes (with AuthGuard)
/admin/audit → AuditRoutes (with AuthGuard)
/pos → PosRoutes
```

## Notes

1. **Legacy Components** (to be cleaned up):
   - `pos/` - Should be migrated to `client/features/pos/`
   - `admin/imports/` - Legacy import component
   - `auth/` - Duplicate of `features/auth/`

2. **Active Components**:
   - `admin/features/admin/admin-layout/` - Active admin layout
   - `admin/features/admin/dashboard/` - Active dashboard
   - `admin/shared/admin-header/` - Admin header (moved to shared)

3. **Path Aliases** (tsconfig.json):
   - `@core/*` → `src/app/core/*`
   - `@shared/*` → `src/app/shared/*`
   - `@features/*` → `src/app/features/*` (legacy, consider updating)
   - `@environments/*` → `src/environments/*`

