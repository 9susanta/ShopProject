using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

public class PayLaterLedger : BaseEntity
{
    public Guid CustomerId { get; private set; }
    public string TransactionType { get; private set; } = string.Empty; // Sale, Payment
    public decimal Amount { get; private set; }
    public decimal BalanceAfter { get; private set; }
    public Guid? SaleId { get; private set; }
    public string? Description { get; private set; }

    // Navigation properties
    public virtual Customer Customer { get; private set; } = null!;
    public virtual Sale? Sale { get; private set; }

    private PayLaterLedger() { } // EF Core

    public PayLaterLedger(Guid customerId, string transactionType, decimal amount, decimal balanceAfter, 
        Guid? saleId = null, string? description = null)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be greater than zero", nameof(amount));

        CustomerId = customerId;
        TransactionType = transactionType;
        Amount = amount;
        BalanceAfter = balanceAfter;
        SaleId = saleId;
        Description = description;
    }
}

