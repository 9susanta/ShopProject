# Grocery Store ERP + POS System - Architecture & Modules

## Overview

This is a production-ready Grocery Store Management System built with **.NET 8** (Backend) and **Angular 20** (Frontend), following Clean Architecture, Domain-Driven Design (DDD), CQRS, and Event-Driven patterns.

## System Architecture

### Backend Architecture (Clean Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                    API Layer                            │
│  (Controllers, Middleware, Filters, DI Configuration) │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              Application Layer                          │
│  (Commands, Queries, DTOs, Validators, Event Handlers) │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                 Domain Layer                            │
│  (Entities, Value Objects, Domain Events, Enums)       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│            Infrastructure Layer                         │
│  (EF Core, Repositories, Services, Event Bus)          │
└─────────────────────────────────────────────────────────┘
```

### Frontend Architecture (Angular 20)

```
┌─────────────────────────────────────────────────────────┐
│              Feature Modules                            │
│  (Admin, POS, Reports, Settings)                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              Core Services                              │
│  (API, Auth, Cache, Models, Guards)                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              Shared Components                          │
│  (UI Components, Form Controls, Validators)              │
└─────────────────────────────────────────────────────────┘
```

---

## Core Modules & Their Responsibilities

### 1. **Master Data Management Module**

**Purpose**: Foundation of the system - manages all reference data

**Domain Entities**:
- `Product` - Product catalog with MRP, Sale Price, Barcode, Tax Slab
- `Category` - Product categorization
- `Unit` - Measurement units (kg, liter, piece, etc.)
- `TaxSlab` - GST tax slabs for products
- `Supplier` - Supplier information
- `Customer` - Customer profiles with loyalty points and pay-later balance
- `StoreSettings` - Store configuration (GSTIN, address, loyalty settings)

**Responsibilities**:
- CRUD operations for all master data
- Product search and filtering
- Bulk product import (Excel/JSON)
- Category hierarchy management
- Tax configuration
- Store settings management

**Importance**: 
- **Critical** - All other modules depend on master data
- Products must exist before sales/purchases
- Categories and tax slabs drive pricing and compliance
- Customer data enables loyalty programs and credit sales

**API Endpoints**:
- `/api/products` - Product management
- `/api/categories` - Category management
- `/api/units` - Unit management
- `/api/taxslabs` - Tax slab management
- `/api/suppliers` - Supplier management
- `/api/customers` - Customer management
- `/api/storesettings` - Store configuration
- `/api/master` - Master data queries

---

### 2. **Purchasing Module**

**Purpose**: Manage procurement from suppliers

**Domain Entities**:
- `PurchaseOrder` - Purchase orders to suppliers
- `PurchaseOrderItem` - Items in purchase orders
- `GoodsReceiveNote` (GRN) - Receipt of goods from suppliers
- `GRNItem` - Items received in GRN
- `SupplierReturn` - Returns to suppliers
- `SupplierReturnItem` - Items in supplier returns
- `SupplierPayment` - Payments made to suppliers

**Responsibilities**:
- Create and manage purchase orders
- Receive goods (GRN creation)
- Track supplier returns
- Record supplier payments
- Calculate outstanding payments
- Auto-update inventory on GRN confirmation

**Importance**:
- **Critical** - Stock replenishment depends on this
- GRN triggers inventory updates
- Supplier payment tracking ensures financial accuracy
- Returns handle defective/damaged goods

**API Endpoints**:
- `/api/purchasing/purchase-orders` - PO management
- `/api/purchasing/grn` - GRN management
- `/api/purchasing/supplier-returns` - Supplier returns
- `/api/suppliers/{id}/payments` - Supplier payments
- `/api/suppliers/outstanding` - Outstanding payments

**Frontend Routes**:
- `/admin/purchasing/purchase-orders` - PO list
- `/admin/purchasing/purchase-orders/new` - Create PO
- `/admin/purchasing/purchase-orders/:id` - PO details
- `/admin/purchasing/grn` - GRN list
- `/admin/purchasing/grn/new` - Create GRN
- `/admin/purchasing/supplier-returns` - Supplier returns

---

### 3. **Inventory Management Module**

**Purpose**: Track stock levels, batches, and inventory movements

**Domain Entities**:
- `Inventory` - Current stock levels per product
- `InventoryBatch` - Batch tracking with expiry dates (FIFO/LIFO)
- `InventoryAdjustment` - Manual stock adjustments
- `InventoryAudit` - Audit trail for inventory changes

**Responsibilities**:
- Real-time stock tracking
- Batch management with expiry tracking
- Low stock alerts
- Expiry management
- Manual stock adjustments
- Inventory valuation (FIFO/LIFO)
- Reorder point management
- Reorder suggestions

**Importance**:
- **Critical** - Prevents overselling
- Batch tracking ensures FIFO/LIFO compliance
- Expiry tracking prevents waste
- Low stock alerts prevent stockouts
- Reorder points automate procurement

**API Endpoints**:
- `/api/inventory/products` - Inventory products list
- `/api/inventory/product/{id}` - Product inventory details
- `/api/inventory/adjustment` - Stock adjustments
- `/api/inventory/low-stock` - Low stock products
- `/api/inventory/expiry-soon` - Expiring batches
- `/api/inventory/valuation` - Inventory valuation
- `/api/inventory/reorder-suggestions` - Reorder suggestions
- `/api/inventory/products/{id}/reorder-point` - Update reorder point
- `/api/admin/inventory/adjust` - Admin adjustments

**Frontend Routes**:
- `/admin/inventory` - Inventory dashboard
- `/admin/inventory/products` - Product batch list
- `/admin/inventory/product/:productId` - Batch details
- `/admin/inventory/low-stock` - Low stock list
- `/admin/inventory/expiry` - Expiry list
- `/admin/inventory/adjust` - Stock adjustment
- `/admin/inventory/list` - Inventory list
- `/admin/inventory/expiry-management` - Expiry management

---

### 4. **Sales & POS Module**

**Purpose**: Process customer sales and manage point-of-sale operations

**Domain Entities**:
- `Sale` - Sales transactions
- `SaleItem` - Items in sales
- `Invoice` - Generated invoices
- `SaleReturn` - Customer returns
- `SaleReturnItem` - Items in returns
- `Refund` - Refunds for returns
- `ServiceToken` - Queue management tokens

**Responsibilities**:
- Process POS sales
- Generate invoices
- Handle customer returns
- Process refunds
- Manage payment methods (Cash, UPI, Card, Pay Later)
- Apply discounts and offers
- Calculate GST (CGST/SGST)
- Loyalty points earning/redeeming
- Queue management with tokens
- Offline POS support
- Thermal receipt printing

**Importance**:
- **Critical** - Primary revenue generation
- POS is the customer-facing interface
- Returns/refunds maintain customer satisfaction
- Payment tracking ensures cash flow accuracy
- Offline support ensures business continuity

**API Endpoints**:
- `/api/sales` - Sales management
- `/api/sales/pos` - POS sale creation
- `/api/sales/{id}/return` - Create sale return
- `/api/sales/returns/{id}/refund` - Process refund
- `/api/service-tokens` - Queue token management
- `/api/sync/offline-sales` - Sync offline sales
- `/api/print/receipt` - Print receipt
- `/api/print/barcode` - Print barcode

**Frontend Routes**:
- `/pos` - POS interface
- `/admin/sales` - Sales list
- `/admin/sales/:id` - Sale details
- `/admin/sales/:id/return` - Create return

---

### 5. **Customer Management Module**

**Purpose**: Manage customer relationships and profiles

**Domain Entities**:
- `Customer` - Customer profiles
- `CustomerSavedItem` - Frequently purchased items
- `LoyaltyTransaction` - Loyalty point transactions
- `PayLaterLedger` - Pay-later (Udhar) ledger entries

**Responsibilities**:
- Customer registration and profile management
- Purchase history tracking
- Loyalty points management
- Pay-later (credit) management
- Saved items (favorites) management
- Customer search by phone

**Importance**:
- **High** - Customer retention and loyalty
- Loyalty program drives repeat business
- Pay-later enables credit sales
- Purchase history enables personalized service

**API Endpoints**:
- `/api/customers` - Customer CRUD
- `/api/customers/by-phone/{phone}` - Find by phone
- `/api/customers/{id}/purchase-history` - Purchase history
- `/api/customers/{id}/ledger` - Pay-later ledger
- `/api/customers/{id}/saved-items` - Saved items
- `/api/customers/{id}/pay-later-settings` - Pay-later settings

**Frontend Routes**:
- `/admin/customers` - Customer list
- `/admin/customers/new` - Create customer
- `/admin/customers/:id` - Customer details
- `/admin/customers/:id/edit` - Edit customer

---

### 6. **Offers & Discounts Module**

**Purpose**: Manage promotional offers and discounts

**Domain Entities**:
- `Offer` - Promotional offers (percentage, flat, BOGO)

**Responsibilities**:
- Create and manage offers
- Apply offers to sales automatically
- Coupon code validation
- Product/category-specific offers
- Store-wide offers

**Importance**:
- **Medium** - Drives sales and customer engagement
- Automatic offer application at POS
- Flexible discount types support various promotions

**API Endpoints**:
- `/api/offers` - Offer management
- `/api/offers/validate-coupon` - Coupon validation

**Frontend Routes**:
- `/admin/offers` - Offer list
- `/admin/offers/new` - Create offer
- `/admin/offers/edit/:id` - Edit offer

---

### 7. **Reports & Analytics Module**

**Purpose**: Business intelligence and compliance reporting

**Reports Available**:
- Daily Sales Report
- GST Summary Report
- GSTR-1 Export (Sales)
- GSTR-2 Export (Purchases)
- Fast-Moving Products
- Slow-Moving Products
- Item-wise Sales Report
- Low Stock Report
- Expiry Report
- Reorder Suggestions

**Responsibilities**:
- Generate various business reports
- Export reports to Excel
- GST compliance exports
- Inventory analysis
- Sales analysis

**Importance**:
- **High** - Business decision making
- GST exports ensure tax compliance
- Reports identify trends and issues
- Inventory reports optimize stock levels

**API Endpoints**:
- `/api/reports/daily-sales` - Daily sales
- `/api/reports/gst-summary` - GST summary
- `/api/reports/fast-moving` - Fast-moving products
- `/api/reports/slow-moving` - Slow-moving products
- `/api/reports/item-wise-sales` - Item-wise sales
- `/api/reports/low-stock` - Low stock report
- `/api/reports/expiry` - Expiry report
- `/api/reports/reorder-suggestions` - Reorder suggestions
- `/api/gst/gstr1` - GSTR-1 export
- `/api/gst/gstr2` - GSTR-2 export

**Frontend Routes**:
- `/admin/reports` - Reports dashboard
- `/admin/reports/daily-sales` - Daily sales
- `/admin/reports/gst-summary` - GST summary
- `/admin/reports/gst-export` - GST export
- `/admin/reports/fast-moving` - Fast-moving
- `/admin/reports/slow-moving` - Slow-moving
- `/admin/reports/item-wise-sales` - Item-wise sales
- `/admin/reports/low-stock` - Low stock
- `/admin/reports/expiry` - Expiry report
- `/admin/reports/reorder-suggestions` - Reorder suggestions

---

### 8. **Accounting Module**

**Purpose**: Financial tracking and daily closing

**Domain Entities**:
- `LedgerEntry` - Accounting ledger entries
- `PayLaterLedger` - Customer credit ledger

**Responsibilities**:
- Automatic ledger entry creation
- Daily closing summaries
- Payment tracking
- Financial reporting

**Importance**:
- **High** - Financial accuracy and compliance
- Automatic ledger ensures no missed entries
- Daily closing provides financial snapshot

**API Endpoints**:
- `/api/accounting/daily-closing` - Daily closing summary

**Frontend Routes**:
- `/admin/accounting/daily-closing` - Daily closing

---

### 9. **User & Permission Management Module**

**Purpose**: Access control and user management

**Domain Entities**:
- `User` - System users (Admin, Staff, SuperAdmin)
- `Permission` - System permissions
- `RolePermission` - Role-permission mappings

**Responsibilities**:
- User management
- Role-based access control (RBAC)
- Permission assignment
- Authentication and authorization

**Importance**:
- **Critical** - Security and access control
- Prevents unauthorized access
- Enables role-based workflows
- Audit trail for user actions

**API Endpoints**:
- `/api/auth/login` - User login
- `/api/auth/refresh` - Token refresh
- `/api/users` - User management
- `/api/permissions` - Permission management
- `/api/permissions/role/{roleName}` - Role permissions
- `/api/permissions/me` - Current user permissions
- `/api/permissions/assign` - Assign permission

**Frontend Routes**:
- `/login` - Login page
- `/admin/settings/roles` - Role management
- `/admin/settings/permissions` - Permission management

---

### 10. **Hardware Integration Module**

**Purpose**: Integrate with physical hardware devices

**Services**:
- `IWeightScaleService` - Weight scale integration
- `IReceiptPrinterService` - Thermal receipt printer
- `IBarcodePrintService` - Barcode printer

**Responsibilities**:
- Read weight from scales
- Print thermal receipts
- Print barcodes
- Handle device connectivity

**Importance**:
- **Medium** - Operational efficiency
- Weight scales automate weight-based sales
- Receipt printers provide customer receipts
- Barcode printing enables product labeling

**API Endpoints**:
- `/api/weight-scale/read` - Read weight
- `/api/weight-scale/tare` - Tare scale
- `/api/weight-scale/status` - Connection status
- `/api/print/receipt` - Print receipt
- `/api/print/barcode` - Print barcode

---

### 11. **Offline Support Module**

**Purpose**: Enable POS operations without internet

**Services**:
- `OfflineStorageService` - IndexedDB wrapper
- `SyncQueueService` - Offline sync queue

**Responsibilities**:
- Store sales data locally when offline
- Queue sales for sync when online
- Detect online/offline status
- Sync queued sales automatically

**Importance**:
- **High** - Business continuity
- Prevents sales loss during internet outages
- Automatic sync when connection restored

**API Endpoints**:
- `/api/sync/offline-sales` - Sync offline sales

**Frontend Components**:
- `offline-indicator` - Shows online/offline status

---

### 12. **Import/Export Module**

**Purpose**: Bulk data operations

**Domain Entities**:
- `ImportJob` - Import job tracking
- `ImportError` - Import error records

**Responsibilities**:
- Bulk product import (Excel/JSON)
- Column mapping
- Error reporting
- Import job tracking
- Real-time progress via SignalR

**Importance**:
- **Medium** - Operational efficiency
- Enables quick product catalog setup
- Reduces manual data entry

**API Endpoints**:
- `/api/admin/imports` - Import management
- `/api/admin/imports/jobs` - Import jobs

**Frontend Routes**:
- `/admin/imports` - Import page
- `/admin/imports/upload` - Upload file
- `/admin/imports/jobs` - Import jobs
- `/admin/imports/jobs/:id` - Job details

---

### 13. **Audit & Logging Module**

**Purpose**: Track system changes and user actions

**Domain Entities**:
- `AuditEntry` - Audit log entries

**Responsibilities**:
- Log all data changes
- Track user actions
- Provide audit trail
- Support compliance requirements

**Importance**:
- **High** - Compliance and security
- Enables change tracking
- Supports regulatory requirements
- Helps in troubleshooting

**API Endpoints**:
- `/api/admin/audits` - Audit logs

**Frontend Routes**:
- `/admin/audit` - Audit logs

---

## Module Dependencies

```
Master Data
    ↓
    ├──→ Purchasing (needs Products, Suppliers)
    ├──→ Inventory (needs Products)
    ├──→ Sales (needs Products, Customers)
    └──→ Reports (needs all modules)

Purchasing
    ↓
    └──→ Inventory (GRN updates stock)

Inventory
    ↓
    └──→ Sales (stock validation)

Sales
    ↓
    ├──→ Accounting (ledger entries)
    ├──→ Reports (sales data)
    └──→ Customer (purchase history, loyalty)

Offers
    ↓
    └──→ Sales (discount application)
```

---

## Technical Patterns Used

### Backend Patterns:
- **Clean Architecture** - Separation of concerns
- **DDD** - Domain-driven design with rich domain models
- **CQRS** - Command Query Responsibility Segregation
- **MediatR** - Mediator pattern for commands/queries
- **Repository Pattern** - Data access abstraction
- **Unit of Work** - Transaction management
- **Event-Driven** - Domain events for decoupling
- **Outbox Pattern** - Reliable event publishing

### Frontend Patterns:
- **Standalone Components** - Angular 20 feature
- **Signals** - Reactive state management
- **Lazy Loading** - Route-based code splitting
- **Service Layer** - Business logic abstraction
- **Guard Pattern** - Route protection
- **Interceptor Pattern** - HTTP request/response handling

---

## Data Flow Examples

### Sale Flow:
```
POS Component
    ↓ (CreatePOSSaleCommand)
Application Handler
    ↓ (Validates stock, applies offers)
Domain Events
    ↓ (SaleCreatedEvent, InventoryReducedEvent)
Event Handlers
    ↓ (Update inventory, create ledger, earn loyalty points)
Database
```

### Purchase Flow:
```
GRN Form
    ↓ (CreateGRNCommand)
Application Handler
    ↓ (Validates PO, creates GRN)
Domain Events
    ↓ (GRNCreatedEvent, InventoryAddedEvent)
Event Handlers
    ↓ (Update inventory, create batches, create ledger)
Database
```

---

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based authorization
- Token refresh mechanism
- Secure password hashing (Argon2id/PBKDF2)
- Rate limiting
- Audit logging
- Input validation (FluentValidation)

---

## Integration Points

1. **Weight Scales** - Serial port communication
2. **Thermal Printers** - ESC/POS commands via serial port
3. **Barcode Printers** - ZXing library for barcode generation
4. **SMS/WhatsApp** - Mock service (ready for integration)
5. **SignalR** - Real-time updates for imports and dashboard

---

## Scalability Considerations

- **Event-Driven Architecture** - Decoupled modules
- **CQRS** - Separate read/write models
- **Lazy Loading** - Frontend code splitting
- **Caching** - API response caching
- **Background Services** - Async processing
- **Outbox Pattern** - Reliable event publishing

---

## Summary

This system is a **complete, production-ready** grocery store management solution with:
- **13 core business modules**
- **35+ domain entities**
- **100+ API endpoints**
- **50+ frontend routes**
- **Event-driven architecture**
- **Offline support**
- **Hardware integration**
- **Comprehensive reporting**
- **GST compliance**

Each module plays a critical role in the overall system, with clear responsibilities and well-defined interfaces. The architecture ensures maintainability, scalability, and extensibility.

