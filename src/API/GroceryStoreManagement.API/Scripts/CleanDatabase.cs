using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GroceryStoreManagement.API.Scripts;

public static class CleanDatabase
{
    public static async Task CleanAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Delete all data except Users
        // Delete in order to respect foreign key constraints
        
        // 1. Delete Sale Returns and Refunds
        context.Refunds.RemoveRange(context.Refunds);
        context.SaleReturnItems.RemoveRange(context.SaleReturnItems);
        context.SaleReturns.RemoveRange(context.SaleReturns);
        
        // 2. Delete Sales
        context.SaleItems.RemoveRange(context.SaleItems);
        context.Sales.RemoveRange(context.Sales);
        
        // 3. Delete Supplier Returns
        context.SupplierReturnItems.RemoveRange(context.SupplierReturnItems);
        context.SupplierReturns.RemoveRange(context.SupplierReturns);
        
        // 4. Delete Supplier Payments (if table exists)
        try
        {
            context.SupplierPayments.RemoveRange(context.SupplierPayments);
        }
        catch
        {
            // Table might not exist yet, ignore
        }
        
        // 5. Delete GRNs
        context.GRNItems.RemoveRange(context.GRNItems);
        context.GoodsReceiveNotes.RemoveRange(context.GoodsReceiveNotes);
        
        // 6. Delete Purchase Orders
        context.PurchaseOrderItems.RemoveRange(context.PurchaseOrderItems);
        context.PurchaseOrders.RemoveRange(context.PurchaseOrders);
        
        // 7. Delete Inventory related
        context.InventoryBatches.RemoveRange(context.InventoryBatches);
        context.InventoryAdjustments.RemoveRange(context.InventoryAdjustments);
        context.InventoryAudits.RemoveRange(context.InventoryAudits);
        context.Inventories.RemoveRange(context.Inventories);
        
        // 8. Delete Products
        context.Products.RemoveRange(context.Products);
        
        // 9. Delete Categories
        context.Categories.RemoveRange(context.Categories);
        
        // 10. Delete Suppliers
        context.Suppliers.RemoveRange(context.Suppliers);
        
        // 11. Delete Customers
        context.CustomerSavedItems.RemoveRange(context.CustomerSavedItems);
        context.LoyaltyTransactions.RemoveRange(context.LoyaltyTransactions);
        context.PayLaterLedgers.RemoveRange(context.PayLaterLedgers);
        context.Customers.RemoveRange(context.Customers);
        
        // 12. Delete Offers
        context.Offers.RemoveRange(context.Offers);
        
        // 13. Delete Tax Slabs (but keep default)
        var taxSlabsToDelete = await context.TaxSlabs.Where(t => !t.IsDefault).ToListAsync();
        context.TaxSlabs.RemoveRange(taxSlabsToDelete);
        
        // 14. Delete Units (but keep essential ones)
        var essentialUnitNames = new[] { "Kilogram", "Gram", "Litre", "Piece", "Pack" };
        var unitsToDelete = await context.Units.Where(u => !essentialUnitNames.Contains(u.Name)).ToListAsync();
        context.Units.RemoveRange(unitsToDelete);
        
        // 15. Delete other entities
        context.ServiceTokens.RemoveRange(context.ServiceTokens);
        context.ImportErrors.RemoveRange(context.ImportErrors);
        context.ImportJobs.RemoveRange(context.ImportJobs);
        context.LedgerEntries.RemoveRange(context.LedgerEntries);
        context.Invoices.RemoveRange(context.Invoices);
        context.OutboxEvents.RemoveRange(context.OutboxEvents);
        context.RolePermissions.RemoveRange(context.RolePermissions);
        context.Permissions.RemoveRange(context.Permissions);
        
        // Users are preserved - no deletion
        
        await context.SaveChangesAsync();
    }
}

