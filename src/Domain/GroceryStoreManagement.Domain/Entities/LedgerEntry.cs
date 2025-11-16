using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Domain.Entities;

public class LedgerEntry : BaseEntity
{
    public LedgerEntryType EntryType { get; private set; }
    public Guid ReferenceId { get; private set; } // PurchaseOrderId or SaleId
    public string ReferenceNumber { get; private set; } = string.Empty;
    public decimal Amount { get; private set; }
    public DateTime EntryDate { get; private set; } = DateTime.UtcNow;
    public string? Description { get; private set; }

    private LedgerEntry() { } // EF Core

    public LedgerEntry(LedgerEntryType entryType, Guid referenceId, string referenceNumber, decimal amount, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(referenceNumber))
            throw new ArgumentException("Reference number cannot be null or empty", nameof(referenceNumber));

        if (amount < 0)
            throw new ArgumentException("Amount cannot be negative", nameof(amount));

        EntryType = entryType;
        ReferenceId = referenceId;
        ReferenceNumber = referenceNumber;
        Amount = amount;
        Description = description;
    }
}

