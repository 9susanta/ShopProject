using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

/// <summary>
/// Item in a Goods Receive Note
/// </summary>
public class GRNItem : BaseEntity
{
    public Guid GRNId { get; private set; }
    public Guid ProductId { get; private set; }
    public int Quantity { get; private set; }
    public decimal UnitCost { get; private set; }
    public decimal TotalCost => Quantity * UnitCost;
    public DateTime? ExpiryDate { get; private set; }
    public string? BatchNumber { get; private set; }

    // Navigation properties
    public virtual GoodsReceiveNote GoodsReceiveNote { get; private set; } = null!;
    public virtual Product Product { get; private set; } = null!;

    private GRNItem() { } // EF Core

    public GRNItem(
        Guid grnId,
        Guid productId,
        int quantity,
        decimal unitCost,
        DateTime? expiryDate = null,
        string? batchNumber = null)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (unitCost < 0)
            throw new ArgumentException("Unit cost cannot be negative", nameof(unitCost));

        GRNId = grnId;
        ProductId = productId;
        Quantity = quantity;
        UnitCost = unitCost;
        ExpiryDate = expiryDate;
        BatchNumber = batchNumber;
    }

    public void UpdateQuantity(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        Quantity = quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateUnitCost(decimal unitCost)
    {
        if (unitCost < 0)
            throw new ArgumentException("Unit cost cannot be negative", nameof(unitCost));

        UnitCost = unitCost;
        UpdatedAt = DateTime.UtcNow;
    }
}

