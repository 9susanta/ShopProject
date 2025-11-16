using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

public class InventoryAdjustment : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Guid InventoryId { get; private set; }
    public int QuantityChange { get; private set; } // Positive for increase, negative for decrease
    public int QuantityBefore { get; private set; }
    public int QuantityAfter { get; private set; }
    public string AdjustmentType { get; private set; } = string.Empty; // Manual, Damage, Return, Expiry
    public string? Reason { get; private set; }
    public string? ReferenceNumber { get; private set; } // PO number, GRN, etc.
    public string AdjustedBy { get; private set; } = string.Empty; // User who made the adjustment

    // Navigation properties
    public virtual Product Product { get; private set; } = null!;
    public virtual Inventory Inventory { get; private set; } = null!;

    private InventoryAdjustment() { } // EF Core

    public InventoryAdjustment(Guid productId, Guid inventoryId, int quantityChange, int quantityBefore,
        string adjustmentType, string adjustedBy, string? reason = null, string? referenceNumber = null)
    {
        if (quantityChange == 0)
            throw new ArgumentException("Quantity change cannot be zero", nameof(quantityChange));

        if (string.IsNullOrWhiteSpace(adjustmentType))
            throw new ArgumentException("Adjustment type cannot be null or empty", nameof(adjustmentType));

        if (string.IsNullOrWhiteSpace(adjustedBy))
            throw new ArgumentException("Adjusted by cannot be null or empty", nameof(adjustedBy));

        ProductId = productId;
        InventoryId = inventoryId;
        QuantityChange = quantityChange;
        QuantityBefore = quantityBefore;
        QuantityAfter = quantityBefore + quantityChange;
        AdjustmentType = adjustmentType;
        AdjustedBy = adjustedBy;
        Reason = reason;
        ReferenceNumber = referenceNumber;
    }
}

