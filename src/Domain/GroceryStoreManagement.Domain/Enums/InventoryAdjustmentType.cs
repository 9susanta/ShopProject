namespace GroceryStoreManagement.Domain.Enums;

public enum InventoryAdjustmentType
{
    Purchase = 0,        // Stock increase from purchase/GRN
    Sale = 1,            // Stock decrease from sale
    Manual = 2,           // Manual adjustment
    Damage = 3,           // Damage adjustment
    Expiry = 4,           // Expired stock removal
    SupplierReturn = 5,   // Return to supplier
    CustomerReturn = 6,   // Return from customer
    StockTake = 7,        // Physical stock count adjustment
    Transfer = 8          // Transfer between locations (future)
}

