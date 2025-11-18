using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

/// <summary>
/// Represents a product that a customer frequently purchases or has saved
/// </summary>
public class CustomerSavedItem : BaseEntity
{
    public Guid CustomerId { get; private set; }
    public Guid ProductId { get; private set; }
    public int PurchaseCount { get; private set; } = 0; // Track how many times purchased
    public DateTime LastPurchasedAt { get; private set; }
    public bool IsFavorite { get; private set; } = false;

    // Navigation properties
    public virtual Customer Customer { get; private set; } = null!;
    public virtual Product Product { get; private set; } = null!;

    private CustomerSavedItem() { } // EF Core

    public CustomerSavedItem(Guid customerId, Guid productId)
    {
        if (customerId == Guid.Empty)
            throw new ArgumentException("Customer ID cannot be empty", nameof(customerId));

        if (productId == Guid.Empty)
            throw new ArgumentException("Product ID cannot be empty", nameof(productId));

        CustomerId = customerId;
        ProductId = productId;
        LastPurchasedAt = DateTime.UtcNow;
    }

    public void IncrementPurchaseCount()
    {
        PurchaseCount++;
        LastPurchasedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetFavorite(bool isFavorite)
    {
        IsFavorite = isFavorite;
        UpdatedAt = DateTime.UtcNow;
    }
}

