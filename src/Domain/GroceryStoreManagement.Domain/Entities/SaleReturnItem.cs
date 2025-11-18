using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

public class SaleReturnItem : BaseEntity
{
    public Guid SaleReturnId { get; private set; }
    public Guid SaleItemId { get; private set; } // Reference to original sale item
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal TotalRefundAmount { get; private set; }
    public string Reason { get; private set; } = string.Empty;

    // Navigation properties
    public virtual SaleReturn SaleReturn { get; private set; } = null!;
    public virtual SaleItem SaleItem { get; private set; } = null!;

    private SaleReturnItem() { } // EF Core

    public SaleReturnItem(
        Guid saleReturnId,
        Guid saleItemId,
        int quantity,
        decimal unitPrice,
        string reason)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (unitPrice < 0)
            throw new ArgumentException("Unit price cannot be negative", nameof(unitPrice));

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Reason cannot be null or empty", nameof(reason));

        SaleReturnId = saleReturnId;
        SaleItemId = saleItemId;
        Quantity = quantity;
        UnitPrice = unitPrice;
        Reason = reason;
        TotalRefundAmount = quantity * unitPrice;
    }
}


