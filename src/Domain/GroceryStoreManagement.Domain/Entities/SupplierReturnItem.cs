using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

/// <summary>
/// Item in a supplier return
/// </summary>
public class SupplierReturnItem : BaseEntity
{
    public Guid SupplierReturnId { get; private set; }
    public Guid ProductId { get; private set; }
    public Guid? BatchId { get; private set; } // Optional - specific batch being returned
    public int Quantity { get; private set; }
    public decimal UnitCost { get; private set; }
    public decimal TotalCost => Quantity * UnitCost;
    public string Reason { get; private set; } = string.Empty;

    // Navigation properties
    public virtual SupplierReturn SupplierReturn { get; private set; } = null!;
    public virtual Product Product { get; private set; } = null!;
    public virtual InventoryBatch? Batch { get; private set; }

    private SupplierReturnItem() { } // EF Core

    public SupplierReturnItem(
        Guid supplierReturnId,
        Guid productId,
        Guid? batchId,
        int quantity,
        decimal unitCost,
        string reason)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (unitCost < 0)
            throw new ArgumentException("Unit cost cannot be negative", nameof(unitCost));

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Reason cannot be null or empty", nameof(reason));

        SupplierReturnId = supplierReturnId;
        ProductId = productId;
        BatchId = batchId;
        Quantity = quantity;
        UnitCost = unitCost;
        Reason = reason;
    }
}

