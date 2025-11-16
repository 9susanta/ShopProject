# Grocery Store Management System

A production-ready, event-driven Grocery Store Management System built with .NET 8, following Clean Architecture, Domain-Driven Design (DDD), CQRS, and MediatR patterns.

## Architecture

The solution follows Clean Architecture principles with clear separation of concerns:

- **Domain Layer**: Core business entities, value objects, domain events, and specifications
- **Application Layer**: Use cases (commands/queries), DTOs, validation, and event handlers
- **Infrastructure Layer**: EF Core implementation, repositories, services, event bus, and background services
- **API Layer**: Controllers, middleware, filters, and dependency injection configuration

## Features

### Business Modules

1. **Master Data Management**
   - Products, Categories, Suppliers, Customers (CRUD operations)
   - Seed data included for quick start

2. **Purchasing Module**
   - Create Purchase Orders
   - Receive Purchase Orders (GRN)
   - Event-driven stock updates

3. **Inventory Module**
   - Automatic stock updates on purchase received
   - Automatic stock reduction on sale completion
   - Low stock alerts via domain events

4. **Billing / POS Module**
   - Create Sales
   - Generate Invoices
   - Event-driven processing

5. **Accounting Module**
   - Automatic ledger entries for purchases and sales
   - Event-driven ledger creation

6. **Notification Module**
   - Low stock notifications (Email/SMS/WhatsApp - mock implementations)
   - Event-driven notifications

7. **Reports Module**
   - Daily sales reports
   - Inventory summary
   - Purchase summary

### Technical Features

- **Event-Driven Architecture**: Domain events using MediatR INotification
- **CQRS**: Separate commands and queries with MediatR
- **Validation**: FluentValidation for request validation
- **Logging**: Serilog for structured logging
- **Exception Handling**: Global exception middleware with standardized error responses
- **Outbox Pattern**: Background service for event publishing (scaffolded for future RabbitMQ integration)
- **JWT Authentication**: Ready for JWT + refresh token flows (configuration included)

## Prerequisites

- .NET 8 SDK
- SQL Server (LocalDB is used by default, or SQL Server Express/Full)
- Visual Studio 2022 or VS Code (optional)

## Getting Started

### 1. Clone and Restore

```bash
git clone <repository-url>
cd ShopProject
dotnet restore
```

### 2. Update Connection String (Optional)

Edit `src/API/GroceryStoreManagement.API/appsettings.json` if you need to change the database connection:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=GroceryStoreManagement;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=true"
  }
}
```

### 3. Build the Solution

```bash
dotnet build
```

### 4. Create and Apply Migrations

```bash
cd src/Infrastructure/GroceryStoreManagement.Infrastructure
dotnet ef migrations add InitialCreate --startup-project ../../API/GroceryStoreManagement.API/GroceryStoreManagement.API.csproj
```

Or if you have the EF Core tools installed globally:

```bash
dotnet ef migrations add InitialCreate --project src/Infrastructure/GroceryStoreManagement.Infrastructure --startup-project src/API/GroceryStoreManagement.API
```

### 5. Run the Application

The database will be automatically migrated and seeded on first run:

```bash
cd src/API/GroceryStoreManagement.API
dotnet run
```

Or from the solution root:

```bash
dotnet run --project src/API/GroceryStoreManagement.API/GroceryStoreManagement.API.csproj
```

The API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `https://localhost:5001/swagger`

## Seed Data

The application automatically seeds the database on startup with:

- **Categories**: Fruits, Vegetables, Dairy, Beverages, Snacks
- **Suppliers**: 3 sample suppliers
- **Customers**: 2 sample customers
- **Products**: 6 sample products with inventory
- **Purchase Orders**: 2 sample purchase orders (received)
- **Sales**: 2 sample sales with invoices

## API Endpoints

### Products

- `POST /api/products` - Create a product
- `GET /api/products/{id}` - Get product by ID

### Purchases

- `POST /api/purchases` - Create a purchase order
- `POST /api/purchases/{id}/receive` - Receive a purchase order

### Sales

- `POST /api/sales` - Create a sale

### Inventory

- `GET /api/inventory/product/{productId}` - Get inventory by product ID

## Testing

Run unit tests:

```bash
dotnet test
```

### Sample Test Scenarios

The test suite includes:
- `ReceivePurchaseOrderHandlerTests` - Tests purchase order receiving
- `UpdateStockOnPurchaseReceivedHandlerTests` - Tests event-driven stock updates

## Event Flow

### Purchase Flow

1. Create Purchase Order → `PurchaseCreatedEvent` published
2. Receive Purchase Order → `PurchaseReceivedEvent` published
3. Event Handlers:
   - `UpdateStockOnPurchaseReceivedHandler` - Updates inventory
   - `CreateLedgerEntriesHandler` - Creates ledger entry
   - Low stock check → `LowStockEvent` if threshold breached

### Sale Flow

1. Create Sale → `SaleCompletedEvent` published
2. Event Handlers:
   - `UpdateStockOnSaleCompletedHandler` - Reduces inventory
   - `CreateLedgerEntriesHandler` - Creates ledger entry
   - Low stock check → `LowStockEvent` if threshold breached

### Low Stock Flow

1. `LowStockEvent` published
2. `NotifyLowStockHandler` - Sends notifications (mock implementation)

## Project Structure

```
/src
  /Domain
    /Entities          # Domain entities
    /ValueObjects      # Value objects (Money, etc.)
    /Enums            # Domain enums
    /Events            # Domain events (MediatR INotification)
    /Specifications   # Query specifications
  /Application
    /Interfaces        # Repository and service interfaces
    /DTOs             # Data transfer objects
    /Commands         # CQRS commands
    /Queries          # CQRS queries
    /EventHandlers    # Domain event handlers
    /Validation       # FluentValidation validators
  /Infrastructure
    /Persistence      # EF Core DbContext and configurations
    /Repositories     # Repository implementations
    /Services        # Service implementations (Email, FileStorage, etc.)
    /EventBus         # In-memory event bus
  /API
    /Controllers      # API controllers
    /Middlewares      # Exception handling middleware
    /Filters          # Action filters
    /DI               # Dependency injection configuration
/tests
  /GroceryStoreManagement.Tests  # Unit tests
```

## Configuration

### Logging

Serilog is configured in `appsettings.json` with:
- Console sink
- File sink (logs stored in `logs/` directory)

### JWT Settings

JWT configuration is in `appsettings.json` (ready for implementation):
```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyForJWTTokenGenerationThatShouldBeAtLeast32Characters",
    "Issuer": "GroceryStoreManagement",
    "Audience": "GroceryStoreManagement",
    "ExpirationInMinutes": 60,
    "RefreshTokenExpirationInDays": 7
  }
}
```

## Future Enhancements

- Replace in-memory event bus with RabbitMQ/Kafka
- Implement JWT authentication endpoints
- Add more comprehensive reporting endpoints
- Implement real email/SMS/WhatsApp services
- Add integration tests
- Add API versioning
- Add rate limiting
- Add caching (Redis)

## Troubleshooting

### Database Connection Issues

If you encounter connection issues:
1. Ensure SQL Server LocalDB is installed
2. Check the connection string in `appsettings.json`
3. Try using SQL Server Express instead

### Migration Issues

If migrations fail:
```bash
# Remove existing migrations
dotnet ef migrations remove --project src/Infrastructure/GroceryStoreManagement.Infrastructure --startup-project src/API/GroceryStoreManagement.API

# Recreate migrations
dotnet ef migrations add InitialCreate --project src/Infrastructure/GroceryStoreManagement.Infrastructure --startup-project src/API/GroceryStoreManagement.API
```

## License

This project is provided as-is for educational and demonstration purposes.

## Contributing

This is a sample project demonstrating Clean Architecture, DDD, CQRS, and event-driven patterns in .NET 8.

