using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GroceryStoreManagement.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Product> Products { get; set; } = null!;
    public DbSet<Supplier> Suppliers { get; set; } = null!;
    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<CustomerSavedItem> CustomerSavedItems { get; set; } = null!;
    public DbSet<Inventory> Inventories { get; set; } = null!;
    public DbSet<PurchaseOrder> PurchaseOrders { get; set; } = null!;
    public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; } = null!;
    public DbSet<Sale> Sales { get; set; } = null!;
    public DbSet<SaleItem> SaleItems { get; set; } = null!;
    public DbSet<Invoice> Invoices { get; set; } = null!;
    public DbSet<LedgerEntry> LedgerEntries { get; set; } = null!;
    public DbSet<OutboxEvent> OutboxEvents { get; set; } = null!;
    public DbSet<Unit> Units { get; set; } = null!;
    public DbSet<TaxSlab> TaxSlabs { get; set; } = null!;
    public DbSet<Offer> Offers { get; set; } = null!;
    public DbSet<LoyaltyTransaction> LoyaltyTransactions { get; set; } = null!;
    public DbSet<PayLaterLedger> PayLaterLedgers { get; set; } = null!;
    public DbSet<StoreSettings> StoreSettings { get; set; } = null!;
    public DbSet<ImportJob> ImportJobs { get; set; } = null!;
    public DbSet<ImportError> ImportErrors { get; set; } = null!;
    public DbSet<InventoryAdjustment> InventoryAdjustments { get; set; } = null!;
    public DbSet<InventoryBatch> InventoryBatches { get; set; } = null!;
    public DbSet<GoodsReceiveNote> GoodsReceiveNotes { get; set; } = null!;
    public DbSet<GRNItem> GRNItems { get; set; } = null!;
    public DbSet<InventoryAudit> InventoryAudits { get; set; } = null!;
    public DbSet<SupplierReturn> SupplierReturns { get; set; } = null!;
    public DbSet<SupplierReturnItem> SupplierReturnItems { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Entities.AuditEntry> AuditEntries { get; set; } = null!;
    public DbSet<Entities.RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<ServiceToken> ServiceTokens { get; set; } = null!;
    public DbSet<SaleReturn> SaleReturns { get; set; } = null!;
    public DbSet<SaleReturnItem> SaleReturnItems { get; set; } = null!;
    public DbSet<Refund> Refunds { get; set; } = null!;
    public DbSet<SupplierPayment> SupplierPayments { get; set; } = null!;
    public DbSet<Permission> Permissions { get; set; } = null!;
    public DbSet<RolePermission> RolePermissions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}

