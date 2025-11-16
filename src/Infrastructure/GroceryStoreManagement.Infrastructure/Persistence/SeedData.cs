using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;

namespace GroceryStoreManagement.Infrastructure.Persistence;

public static class SeedData
{
    public static async Task SeedAsync(ApplicationDbContext context, IServiceProvider? serviceProvider = null)
    {
        // Seed Users first (if not already seeded)
        if (!context.Users.Any() && serviceProvider != null)
        {
            var passwordHasher = serviceProvider.GetRequiredService<IPasswordHasher>();
            
            // Create SuperAdmin user
            var superAdminResult = passwordHasher.HashPassword("SuperAdmin@123"); // Default password
            var superAdmin = new User(
                "superadmin@grocerystore.com",
                "Super Admin",
                superAdminResult.Hash,
                UserRole.SuperAdmin,
                "+911234567890"
            );
            superAdmin.SetPasswordMetadata(superAdminResult.Algorithm, superAdminResult.Salt, superAdminResult.Iterations);

            // Create Admin user
            var adminResult = passwordHasher.HashPassword("Admin@123"); // Default password
            var admin = new User(
                "admin@grocerystore.com",
                "Admin User",
                adminResult.Hash,
                UserRole.Admin,
                "+911234567891"
            );
            admin.SetPasswordMetadata(adminResult.Algorithm, adminResult.Salt, adminResult.Iterations);

            // Create Staff user
            var staffResult = passwordHasher.HashPassword("Staff@123"); // Default password
            var staff = new User(
                "staff@grocerystore.com",
                "Staff User",
                staffResult.Hash,
                UserRole.Staff,
                "+911234567892"
            );
            staff.SetPasswordMetadata(staffResult.Algorithm, staffResult.Salt, staffResult.Iterations);

            await context.Users.AddRangeAsync(superAdmin, admin, staff);
            await context.SaveChangesAsync();
        }

        if (context.Categories.Any())
            return; // Database already seeded

        // Seed Units
        var units = new List<Unit>
        {
            new Unit("Kilogram", "kg", UnitType.Kilogram, 1),
            new Unit("Gram", "gm", UnitType.Gram, 0.001m),
            new Unit("Litre", "L", UnitType.Litre, 1),
            new Unit("Piece", "pcs", UnitType.Piece, 1),
            new Unit("Pack", "pack", UnitType.Pack, 1)
        };

        await context.Units.AddRangeAsync(units);
        await context.SaveChangesAsync();

        // Seed Tax Slabs (Indian GST rates)
        var taxSlabs = new List<TaxSlab>
        {
            new TaxSlab("5% GST", 2.5m, 2.5m), // 5% = 2.5% CGST + 2.5% SGST
            new TaxSlab("12% GST", 6m, 6m),     // 12% = 6% CGST + 6% SGST
            new TaxSlab("18% GST", 9m, 9m)      // 18% = 9% CGST + 9% SGST
        };

        await context.TaxSlabs.AddRangeAsync(taxSlabs);
        await context.SaveChangesAsync();

        // Seed Categories
        var categories = new List<Category>
        {
            new Category("Fruits", "Fresh fruits"),
            new Category("Vegetables", "Fresh vegetables"),
            new Category("Dairy", "Dairy products"),
            new Category("Beverages", "Drinks and beverages"),
            new Category("Snacks", "Snacks and chips")
        };

        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();

        // Seed Suppliers
        var suppliers = new List<Supplier>
        {
            new Supplier("Fresh Foods Inc", "John Doe", "john@freshfoods.com", "555-0101", "123 Main St"),
            new Supplier("Dairy Delights", "Jane Smith", "jane@dairydelights.com", "555-0102", "456 Oak Ave"),
            new Supplier("Beverage Co", "Bob Johnson", "bob@beverageco.com", "555-0103", "789 Pine Rd")
        };

        await context.Suppliers.AddRangeAsync(suppliers);
        await context.SaveChangesAsync();

        // Seed Customers (Phone is required)
        var customers = new List<Customer>
        {
            new Customer("Alice Brown", "5550201", "alice@email.com", "100 Elm St"),
            new Customer("Charlie Wilson", "5550202", "charlie@email.com", "200 Maple Dr")
        };

        await context.Customers.AddRangeAsync(customers);
        await context.SaveChangesAsync();

        // Seed Products (with MRP, SalePrice, UnitId, TaxSlabId)
        var products = new List<Product>
        {
            new Product("Apple", "FRUIT-001", 2.00m, 1.50m, categories[0].Id, units[3].Id, taxSlabs[0].Id, "Red delicious apples", "1234567890123", null, 20),
            new Product("Banana", "FRUIT-002", 1.00m, 0.75m, categories[0].Id, units[3].Id, taxSlabs[0].Id, "Fresh bananas", "1234567890124", null, 30),
            new Product("Carrot", "VEG-001", 1.20m, 1.00m, categories[1].Id, units[1].Id, taxSlabs[0].Id, "Fresh carrots", "1234567890125", null, 25),
            new Product("Milk", "DAIRY-001", 4.00m, 3.50m, categories[2].Id, units[2].Id, taxSlabs[1].Id, "Whole milk 1 litre", "1234567890126", null, 15),
            new Product("Coca Cola", "BEV-001", 2.50m, 2.00m, categories[3].Id, units[3].Id, taxSlabs[2].Id, "12 oz can", "1234567890127", null, 50),
            new Product("Potato Chips", "SNACK-001", 4.50m, 3.99m, categories[4].Id, units[4].Id, taxSlabs[2].Id, "Classic flavor", "1234567890128", null, 40)
        };

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();

        // Seed Inventory
        var inventories = products.Select(p => new Inventory(p.Id, Random.Shared.Next(20, 100))).ToList();
        await context.Inventories.AddRangeAsync(inventories);
        await context.SaveChangesAsync();

        // Seed Sample Purchase Orders
        var purchaseOrder1 = new PurchaseOrder("PO-001", suppliers[0].Id, DateTime.UtcNow.AddDays(7));
        purchaseOrder1.AddItem(products[0].Id, 100, 1.20m);
        purchaseOrder1.AddItem(products[1].Id, 150, 0.60m);
        purchaseOrder1.Submit();
        purchaseOrder1.Receive(DateTime.UtcNow.AddDays(-2));

        var purchaseOrder2 = new PurchaseOrder("PO-002", suppliers[1].Id, DateTime.UtcNow.AddDays(5));
        purchaseOrder2.AddItem(products[3].Id, 50, 3.00m);
        purchaseOrder2.Submit();
        purchaseOrder2.Receive(DateTime.UtcNow.AddDays(-1));

        await context.PurchaseOrders.AddRangeAsync(purchaseOrder1, purchaseOrder2);
        await context.SaveChangesAsync();

        // Seed Sample Sales
        var sale1 = new Sale("INV-001", customers[0].Id, discountAmount: 0);
        sale1.AddItem(products[0].Id, 5, products[0].SalePrice);
        sale1.AddItem(products[2].Id, 3, products[2].SalePrice);
        // Set GST rates for items
        sale1.Items.First(i => i.ProductId == products[0].Id).SetGSTRates(taxSlabs[0].CGSTRate, taxSlabs[0].SGSTRate);
        sale1.Items.First(i => i.ProductId == products[2].Id).SetGSTRates(taxSlabs[0].CGSTRate, taxSlabs[0].SGSTRate);
        sale1.Complete();

        var sale2 = new Sale("INV-002", customers[1].Id, discountAmount: 2.00m);
        sale2.AddItem(products[4].Id, 10, products[4].SalePrice);
        sale2.AddItem(products[5].Id, 2, products[5].SalePrice);
        // Set GST rates for items
        sale2.Items.First(i => i.ProductId == products[4].Id).SetGSTRates(taxSlabs[2].CGSTRate, taxSlabs[2].SGSTRate);
        sale2.Items.First(i => i.ProductId == products[5].Id).SetGSTRates(taxSlabs[2].CGSTRate, taxSlabs[2].SGSTRate);
        sale2.Complete();

        await context.Sales.AddRangeAsync(sale1, sale2);
        await context.SaveChangesAsync();

        // Create invoices
        var invoice1 = new Invoice(sale1.Id, sale1.InvoiceNumber, sale1.SubTotal, sale1.TotalGSTAmount, sale1.DiscountAmount, sale1.TotalAmount);
        var invoice2 = new Invoice(sale2.Id, sale2.InvoiceNumber, sale2.SubTotal, sale2.TotalGSTAmount, sale2.DiscountAmount, sale2.TotalAmount);

        await context.Invoices.AddRangeAsync(invoice1, invoice2);
        await context.SaveChangesAsync();

        // Seed Store Settings
        var storeSettings = new StoreSettings("My Grocery Store", "29ABCDE1234F1Z5", "123 Main Street, City, State");
        storeSettings.Update("My Grocery Store", "29ABCDE1234F1Z5", "123 Main Street", "Mumbai", "Maharashtra", "400001", "022-12345678", "store@example.com");
        await context.StoreSettings.AddAsync(storeSettings);
        await context.SaveChangesAsync();
    }
}

