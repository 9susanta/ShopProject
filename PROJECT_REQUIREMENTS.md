# Grocery Store ERP + POS System - Project Requirements

## Overview

This is a **production-ready Grocery Store Management System** built with **.NET 8** (Backend) and **Angular 20** (Frontend), following Clean Architecture, Domain-Driven Design (DDD), CQRS, and Event-Driven patterns.

---

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

## Core Modules & Requirements

### 1. Master Data Management Module

**Purpose**: Foundation of the system - manages all reference data

**Entities**:
- `Product` - Product catalog with MRP, Sale Price, Barcode, Tax Slab
- `Category` - Product categorization
- `Unit` - Measurement units (kg, liter, piece, etc.)
- `TaxSlab` - GST tax slabs for products
- `Supplier` - Supplier information
- `Customer` - Customer profiles with loyalty points and pay-later balance
- `StoreSettings` - Store configuration (GSTIN, address, loyalty settings)

**Requirements**:
- CRUD operations for all master data
- Product search and filtering
- Bulk product import (Excel/JSON)
- Category hierarchy management
- Tax configuration
- Store settings management

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

### 2. Purchasing Module

**Purpose**: Manage procurement from suppliers

**Entities**:
- `PurchaseOrder` - Purchase orders to suppliers
- `PurchaseOrderItem` - Items in purchase orders
- `GoodsReceiveNote` (GRN) - Receipt of goods from suppliers
- `GRNItem` - Items received in GRN
- `SupplierReturn` - Returns to suppliers
- `SupplierReturnItem` - Items in supplier returns
- `SupplierPayment` - Payments made to suppliers

**Requirements**:
- Create and manage purchase orders
- Receive goods (GRN creation)
- Track supplier returns
- Record supplier payments
- Calculate outstanding payments
- Auto-update inventory on GRN confirmation

**API Endpoints**:
- `/api/purchasing/purchase-orders` - PO management
- `/api/purchasing/grn` - GRN management
- `/api/purchasing/supplier-returns` - Supplier returns
- `/api/suppliers/{id}/payments` - Supplier payments
- `/api/suppliers/outstanding` - Outstanding payments

---

### 3. Inventory Management Module

**Purpose**: Track stock levels, batches, and inventory movements

**Entities**:
- `Inventory` - Current stock levels per product
- `InventoryBatch` - Batch tracking with expiry dates (FIFO/LIFO)
- `InventoryAdjustment` - Manual stock adjustments
- `InventoryAudit` - Audit trail for inventory changes

**Requirements**:
- Real-time stock tracking
- Batch management with expiry tracking
- Low stock alerts
- Expiry management
- Manual stock adjustments
- Inventory valuation (FIFO/LIFO)
- Reorder point management
- Reorder suggestions

**API Endpoints**:
- `/api/inventory/products` - Inventory products list
- `/api/inventory/product/{id}` - Product inventory details
- `/api/inventory/adjustment` - Stock adjustments
- `/api/inventory/low-stock` - Low stock products
- `/api/inventory/expiry-soon` - Expiring batches
- `/api/inventory/valuation` - Inventory valuation
- `/api/inventory/reorder-suggestions` - Reorder suggestions

---

### 4. Sales & POS Module

**Purpose**: Process customer sales and manage point-of-sale operations

**Entities**:
- `Sale` - Sales transactions
- `SaleItem` - Items in sales
- `Invoice` - Generated invoices
- `SaleReturn` - Customer returns
- `SaleReturnItem` - Items in returns
- `Refund` - Refunds for returns
- `ServiceToken` - Queue management tokens

**Requirements**:
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

**API Endpoints**:
- `/api/sales` - Sales management
- `/api/sales/pos` - POS sale creation
- `/api/sales/{id}/return` - Create sale return
- `/api/sales/returns/{id}/refund` - Process refund
- `/api/service-tokens` - Queue token management
- `/api/sync/offline-sales` - Sync offline sales
- `/api/print/receipt` - Print receipt
- `/api/print/barcode` - Print barcode

---

### 5. Customer Management Module

**Purpose**: Manage customer relationships and profiles

**Entities**:
- `Customer` - Customer profiles
- `CustomerSavedItem` - Frequently purchased items
- `LoyaltyTransaction` - Loyalty point transactions
- `PayLaterLedger` - Pay-later (Udhar) ledger entries

**Requirements**:
- Customer registration and profile management
- Purchase history tracking
- Loyalty points management
- Pay-later (credit) management
- Saved items (favorites) management
- Customer search by phone

**API Endpoints**:
- `/api/customers` - Customer CRUD
- `/api/customers/by-phone/{phone}` - Find by phone
- `/api/customers/{id}/purchase-history` - Purchase history
- `/api/customers/{id}/ledger` - Pay-later ledger
- `/api/customers/{id}/saved-items` - Saved items

---

### 6. Offers & Discounts Module

**Purpose**: Manage promotional offers and discounts

**Entities**:
- `Offer` - Promotional offers (percentage, flat, BOGO)

**Requirements**:
- Create and manage offers
- Apply offers to sales automatically
- Coupon code validation
- Product/category-specific offers
- Store-wide offers

**API Endpoints**:
- `/api/offers` - Offer management
- `/api/offers/validate-coupon` - Coupon validation

---

### 7. Reports & Analytics Module

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
- Purchase Summary Report

**Requirements**:
- Generate various business reports
- Export reports to Excel/PDF
- GST compliance exports
- Inventory analysis
- Sales analysis

**API Endpoints**:
- `/api/reports/daily-sales` - Daily sales
- `/api/reports/gst-summary` - GST summary
- `/api/reports/fast-moving` - Fast-moving products
- `/api/reports/slow-moving` - Slow-moving products
- `/api/reports/item-wise-sales` - Item-wise sales
- `/api/reports/low-stock` - Low stock report
- `/api/reports/expiry` - Expiry report
- `/api/reports/purchase-summary` - Purchase summary
- `/api/gst/gstr1` - GSTR-1 export
- `/api/gst/gstr2` - GSTR-2 export

---

### 8. Accounting Module

**Purpose**: Financial tracking and daily closing

**Entities**:
- `LedgerEntry` - Accounting ledger entries
- `PayLaterLedger` - Customer credit ledger

**Requirements**:
- Automatic ledger entry creation
- Daily closing summaries
- Payment tracking
- Financial reporting

**API Endpoints**:
- `/api/accounting/daily-closing` - Daily closing summary

---

### 9. User & Permission Management Module

**Purpose**: Access control and user management

**Entities**:
- `User` - System users (Admin, Staff, SuperAdmin)
- `Permission` - System permissions
- `RolePermission` - Role-permission mappings

**Requirements**:
- User management
- Role-based access control (RBAC)
- Permission assignment
- Authentication and authorization
- Account lockout after failed attempts

**API Endpoints**:
- `/api/auth/login` - User login
- `/api/auth/refresh` - Token refresh
- `/api/users` - User management
- `/api/permissions` - Permission management
- `/api/permissions/me` - Current user permissions

---

### 10. Hardware Integration Module

**Purpose**: Integrate with physical hardware devices

**Services**:
- `IWeightScaleService` - Weight scale integration
- `IReceiptPrinterService` - Thermal receipt printer
- `IBarcodePrintService` - Barcode printer

**Requirements**:
- Read weight from scales
- Print thermal receipts
- Print barcodes
- Handle device connectivity

**API Endpoints**:
- `/api/weight-scale/read` - Read weight
- `/api/print/receipt` - Print receipt
- `/api/print/barcode` - Print barcode

---

### 11. Offline Support Module

**Purpose**: Enable POS operations without internet

**Requirements**:
- Store sales data locally when offline
- Queue sales for sync when online
- Detect online/offline status
- Sync queued sales automatically

**API Endpoints**:
- `/api/sync/offline-sales` - Sync offline sales

---

### 12. Import/Export Module

**Purpose**: Bulk data operations

**Entities**:
- `ImportJob` - Import job tracking
- `ImportError` - Import error records

**Requirements**:
- Bulk product import (Excel/JSON)
- Column mapping
- Error reporting
- Import job tracking
- Real-time progress via SignalR

**API Endpoints**:
- `/api/admin/imports` - Import management
- `/api/admin/imports/jobs` - Import jobs

---

### 13. Audit & Logging Module

**Purpose**: Track system changes and user actions

**Entities**:
- `AuditEntry` - Audit log entries

**Requirements**:
- Log all data changes
- Track user actions
- Provide audit trail
- Support compliance requirements

**API Endpoints**:
- `/api/admin/audits` - Audit logs

---

## Technical Requirements

### Backend Technologies
- **.NET 8** - Framework
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **MediatR** - CQRS implementation
- **FluentValidation** - Input validation
- **AutoMapper** - Object mapping
- **JWT** - Authentication
- **SignalR** - Real-time communication
- **Argon2id/PBKDF2** - Password hashing

### Frontend Technologies
- **Angular 20** - Framework
- **Angular Material** - UI components
- **RxJS** - Reactive programming
- **TypeScript** - Language
- **Tailwind CSS** - Styling
- **IndexedDB** - Offline storage
- **ZXing** - Barcode generation

### Design Patterns
- **Clean Architecture** - Separation of concerns
- **DDD** - Domain-driven design
- **CQRS** - Command Query Responsibility Segregation
- **Repository Pattern** - Data access abstraction
- **Unit of Work** - Transaction management
- **Event-Driven** - Domain events for decoupling
- **Outbox Pattern** - Reliable event publishing

### Security Requirements
- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based authorization
- Token refresh mechanism
- Secure password hashing
- Rate limiting
- Audit logging
- Input validation

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

## Project Structure

### Backend Structure
```
src/
├── API/                          # API Layer
│   └── GroceryStoreManagement.API/
│       ├── Controllers/          # Organized by feature
│       │   ├── Admin/
│       │   ├── MasterData/
│       │   ├── Purchasing/
│       │   ├── Sales/
│       │   └── ...
│       ├── Middlewares/
│       └── Program.cs
├── Application/                  # Application Layer
│   └── GroceryStoreManagement.Application/
│       ├── Commands/            # Organized by feature
│       ├── Queries/             # Organized by feature
│       ├── DTOs/                # Organized by feature
│       └── Services/
├── Domain/                        # Domain Layer
│   └── GroceryStoreManagement.Domain/
│       ├── Entities/
│       ├── Events/
│       └── Enums/
└── Infrastructure/               # Infrastructure Layer
    └── GroceryStoreManagement.Infrastructure/
        ├── Persistence/
        ├── Services/
        └── Repositories/
```

### Frontend Structure
```
frontend/src/app/
├── admin/                        # Admin features
│   ├── features/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── purchasing/
│   │   ├── sales/
│   │   └── ...
│   └── shared/
├── client/                       # POS features
│   └── features/pos/
├── core/                         # Core services
│   ├── services/
│   ├── guards/
│   └── models/
└── shared/                       # Shared components
```

---

## Database Requirements

- **SQL Server** (LocalDB for development, SQL Server for production)
- **Migrations** - EF Core migrations for schema management
- **Seed Data** - Automatic seeding of test users and initial data
- **Audit Trail** - All changes tracked in audit tables

---

## Integration Requirements

1. **Weight Scales** - Serial port communication
2. **Thermal Printers** - ESC/POS commands via serial port
3. **Barcode Printers** - ZXing library for barcode generation
4. **SMS/WhatsApp** - Mock service (ready for integration)
5. **SignalR** - Real-time updates for imports and dashboard

---

## Performance Requirements

- **Response Time**: < 500ms for most API calls
- **Offline Support**: POS must work without internet
- **Caching**: API response caching for frequently accessed data
- **Lazy Loading**: Frontend code splitting for faster initial load
- **Background Services**: Async processing for heavy operations

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

