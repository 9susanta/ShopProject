using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Domain.Entities;

public class SaleReturn : BaseEntity
{
    public string ReturnNumber { get; private set; } = string.Empty;
    public Guid SaleId { get; private set; }
    public DateTime ReturnDate { get; private set; } = DateTime.UtcNow;
    public string Reason { get; private set; } = string.Empty;
    public ReturnStatus Status { get; private set; } = ReturnStatus.Pending;
    public decimal TotalRefundAmount { get; private set; }
    public string? Notes { get; private set; }
    public Guid? ProcessedByUserId { get; private set; }
    public DateTime? ProcessedAt { get; private set; }

    // Navigation properties
    public virtual Sale Sale { get; private set; } = null!;
    public virtual ICollection<SaleReturnItem> Items { get; private set; } = new List<SaleReturnItem>();
    public virtual Refund? Refund { get; private set; }

    private SaleReturn() { } // EF Core

    public SaleReturn(
        string returnNumber,
        Guid saleId,
        DateTime returnDate,
        string reason,
        string? notes = null)
    {
        if (string.IsNullOrWhiteSpace(returnNumber))
            throw new ArgumentException("Return number cannot be null or empty", nameof(returnNumber));

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Reason cannot be null or empty", nameof(reason));

        ReturnNumber = returnNumber;
        SaleId = saleId;
        ReturnDate = returnDate;
        Reason = reason;
        Notes = notes;
        Status = ReturnStatus.Pending;
    }

    public void AddItem(Guid saleItemId, int quantity, decimal unitPrice, string reason)
    {
        if (Status != ReturnStatus.Pending)
            throw new InvalidOperationException("Cannot add items to a non-pending return");

        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (unitPrice < 0)
            throw new ArgumentException("Unit price cannot be negative", nameof(unitPrice));

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Reason cannot be null or empty", nameof(reason));

        var item = new SaleReturnItem(Id, saleItemId, quantity, unitPrice, reason);
        Items.Add(item);
        RecalculateTotal();
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveItem(Guid itemId)
    {
        if (Status != ReturnStatus.Pending)
            throw new InvalidOperationException("Cannot remove items from a non-pending return");

        var item = Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new InvalidOperationException($"Item with id {itemId} not found");

        Items.Remove(item);
        RecalculateTotal();
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid processedByUserId)
    {
        if (Status != ReturnStatus.Pending)
            throw new InvalidOperationException("Only pending returns can be approved");

        if (!Items.Any())
            throw new InvalidOperationException("Cannot approve a return without items");

        Status = ReturnStatus.Approved;
        ProcessedByUserId = processedByUserId;
        ProcessedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(Guid processedByUserId, string? reason = null)
    {
        if (Status != ReturnStatus.Pending)
            throw new InvalidOperationException("Only pending returns can be rejected");

        Status = ReturnStatus.Rejected;
        ProcessedByUserId = processedByUserId;
        ProcessedAt = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(reason))
            Notes = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsRefunded()
    {
        if (Status != ReturnStatus.Approved)
            throw new InvalidOperationException("Only approved returns can be marked as refunded");

        Status = ReturnStatus.Refunded;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == ReturnStatus.Refunded)
            throw new InvalidOperationException("Cannot cancel a refunded return");

        Status = ReturnStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    private void RecalculateTotal()
    {
        TotalRefundAmount = Items.Sum(i => i.TotalRefundAmount);
    }
}


