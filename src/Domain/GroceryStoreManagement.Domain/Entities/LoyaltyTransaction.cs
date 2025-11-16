using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

public class LoyaltyTransaction : BaseEntity
{
    public Guid CustomerId { get; private set; }
    public int Points { get; private set; }
    public string TransactionType { get; private set; } = string.Empty; // Earned, Redeemed
    public Guid? SaleId { get; private set; }
    public string? Description { get; private set; }

    // Navigation properties
    public virtual Customer Customer { get; private set; } = null!;
    public virtual Sale? Sale { get; private set; }

    private LoyaltyTransaction() { } // EF Core

    public LoyaltyTransaction(Guid customerId, int points, string transactionType, Guid? saleId = null, string? description = null)
    {
        if (points <= 0)
            throw new ArgumentException("Points must be greater than zero", nameof(points));

        CustomerId = customerId;
        Points = points;
        TransactionType = transactionType;
        SaleId = saleId;
        Description = description;
    }
}

