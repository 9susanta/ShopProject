using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Domain.Entities;

public class Refund : BaseEntity
{
    public Guid SaleReturnId { get; private set; }
    public decimal Amount { get; private set; }
    public PaymentMethod PaymentMethod { get; private set; }
    public RefundStatus Status { get; private set; } = RefundStatus.Pending;
    public string? TransactionId { get; private set; } // For UPI/Card refunds
    public string? ReferenceNumber { get; private set; }
    public DateTime? ProcessedAt { get; private set; }
    public Guid? ProcessedByUserId { get; private set; }
    public string? Notes { get; private set; }

    // Navigation properties
    public virtual SaleReturn SaleReturn { get; private set; } = null!;

    private Refund() { } // EF Core

    public Refund(
        Guid saleReturnId,
        decimal amount,
        PaymentMethod paymentMethod,
        string? transactionId = null,
        string? referenceNumber = null,
        string? notes = null)
    {
        if (amount <= 0)
            throw new ArgumentException("Refund amount must be greater than zero", nameof(amount));

        SaleReturnId = saleReturnId;
        Amount = amount;
        PaymentMethod = paymentMethod;
        TransactionId = transactionId;
        ReferenceNumber = referenceNumber;
        Notes = notes;
        Status = RefundStatus.Pending;
    }

    public void Process(Guid processedByUserId, string? transactionId = null)
    {
        if (Status != RefundStatus.Pending)
            throw new InvalidOperationException("Only pending refunds can be processed");

        Status = RefundStatus.Processed;
        ProcessedAt = DateTime.UtcNow;
        ProcessedByUserId = processedByUserId;
        if (!string.IsNullOrWhiteSpace(transactionId))
            TransactionId = transactionId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Fail(string? reason = null)
    {
        if (Status != RefundStatus.Pending)
            throw new InvalidOperationException("Only pending refunds can be marked as failed");

        Status = RefundStatus.Failed;
        if (!string.IsNullOrWhiteSpace(reason))
            Notes = reason;
        UpdatedAt = DateTime.UtcNow;
    }
}


