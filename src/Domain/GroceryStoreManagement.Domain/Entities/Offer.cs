using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Domain.Entities;

public class Offer : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public OfferType Type { get; private set; }
    public decimal DiscountValue { get; private set; } // Percentage or amount
    public int? MinQuantity { get; private set; }
    public int? MaxQuantity { get; private set; }
    public Guid? ProductId { get; private set; } // Null for category/store-wide offers
    public Guid? CategoryId { get; private set; }
    public string? CouponCode { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Navigation properties
    public virtual Product? Product { get; private set; }
    public virtual Category? Category { get; private set; }

    private Offer() { } // EF Core

    public Offer(string name, OfferType type, decimal discountValue, DateTime startDate, DateTime endDate,
        Guid? productId = null, Guid? categoryId = null, string? couponCode = null, 
        string? description = null, int? minQuantity = null, int? maxQuantity = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Offer name cannot be null or empty", nameof(name));

        if (discountValue < 0)
            throw new ArgumentException("Discount value cannot be negative", nameof(discountValue));

        if (endDate < startDate)
            throw new ArgumentException("End date cannot be before start date");

        Name = name;
        Type = type;
        DiscountValue = discountValue;
        StartDate = startDate;
        EndDate = endDate;
        ProductId = productId;
        CategoryId = categoryId;
        CouponCode = couponCode;
        Description = description;
        MinQuantity = minQuantity;
        MaxQuantity = maxQuantity;
    }

    public bool IsValid(DateTime? checkDate = null)
    {
        var date = checkDate ?? DateTime.UtcNow;
        return IsActive && date >= StartDate && date <= EndDate;
    }

    public decimal CalculateDiscount(decimal amount, int quantity = 1)
    {
        if (!IsValid())
            return 0;

        if (MinQuantity.HasValue && quantity < MinQuantity.Value)
            return 0;

        if (MaxQuantity.HasValue && quantity > MaxQuantity.Value)
            return 0;

        return Type switch
        {
            OfferType.PercentageDiscount => amount * (DiscountValue / 100),
            OfferType.FlatDiscount => DiscountValue,
            OfferType.BuyOneGetOne => quantity >= 2 ? amount / quantity : 0, // Free one item
            _ => 0
        };
    }
}

