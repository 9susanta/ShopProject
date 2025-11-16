using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

public class SaleItem : BaseEntity
{
    public Guid SaleId { get; private set; }
    public Guid ProductId { get; private set; }
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal DiscountAmount { get; private set; } = 0;
    public decimal CGSTRate { get; private set; } // From product's tax slab
    public decimal SGSTRate { get; private set; } // From product's tax slab
    public decimal TotalPrice => (Quantity * UnitPrice) - DiscountAmount;
    public decimal CGSTAmount => TotalPrice * (CGSTRate / 100);
    public decimal SGSTAmount => TotalPrice * (SGSTRate / 100);
    public decimal TotalWithGST => TotalPrice + CGSTAmount + SGSTAmount;
    public Guid? OfferId { get; private set; } // Applied offer

    // Navigation properties
    public virtual Sale Sale { get; private set; } = null!;
    public virtual Product Product { get; private set; } = null!;
    public virtual Offer? Offer { get; private set; }

    private SaleItem() { } // EF Core

    public SaleItem(Guid saleId, Guid productId, int quantity, decimal unitPrice, 
        decimal cgstRate = 0, decimal sgstRate = 0, decimal discountAmount = 0, Guid? offerId = null)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (unitPrice < 0)
            throw new ArgumentException("Unit price cannot be negative", nameof(unitPrice));

        SaleId = saleId;
        ProductId = productId;
        Quantity = quantity;
        UnitPrice = unitPrice;
        CGSTRate = cgstRate;
        SGSTRate = sgstRate;
        DiscountAmount = discountAmount;
        OfferId = offerId;
    }

    public void UpdateQuantity(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        Quantity = quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateUnitPrice(decimal unitPrice)
    {
        if (unitPrice < 0)
            throw new ArgumentException("Unit price cannot be negative", nameof(unitPrice));

        UnitPrice = unitPrice;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ApplyDiscount(decimal discountAmount, Guid? offerId = null)
    {
        if (discountAmount < 0)
            throw new ArgumentException("Discount amount cannot be negative", nameof(discountAmount));

        DiscountAmount = discountAmount;
        OfferId = offerId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetGSTRates(decimal cgstRate, decimal sgstRate)
    {
        if (cgstRate < 0 || sgstRate < 0)
            throw new ArgumentException("GST rates cannot be negative");

        CGSTRate = cgstRate;
        SGSTRate = sgstRate;
        UpdatedAt = DateTime.UtcNow;
    }
}

