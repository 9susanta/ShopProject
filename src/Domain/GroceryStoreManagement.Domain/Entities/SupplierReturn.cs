using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

/// <summary>
/// Represents a return of goods to supplier (creates negative stock entry and supplier credit)
/// </summary>
public class SupplierReturn : BaseEntity
{
    public string ReturnNumber { get; private set; } = string.Empty;
    public Guid SupplierId { get; private set; }
    public Guid? GRNId { get; private set; } // Optional - link to original GRN
    public DateTime ReturnDate { get; private set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; private set; }
    public string Reason { get; private set; } = string.Empty;
    public string? Notes { get; private set; }

    // Navigation properties
    public virtual Supplier Supplier { get; private set; } = null!;
    public virtual GoodsReceiveNote? GoodsReceiveNote { get; private set; }
    public virtual ICollection<SupplierReturnItem> Items { get; private set; } = new List<SupplierReturnItem>();

    private SupplierReturn() { } // EF Core

    public SupplierReturn(
        string returnNumber,
        Guid supplierId,
        DateTime returnDate,
        string reason,
        Guid? grnId = null,
        string? notes = null)
    {
        if (string.IsNullOrWhiteSpace(returnNumber))
            throw new ArgumentException("Return number cannot be null or empty", nameof(returnNumber));

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Reason cannot be null or empty", nameof(reason));

        ReturnNumber = returnNumber;
        SupplierId = supplierId;
        GRNId = grnId;
        ReturnDate = returnDate;
        Reason = reason;
        Notes = notes;
    }

    public void AddItem(Guid productId, Guid? batchId, int quantity, decimal unitCost, string reason)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (unitCost < 0)
            throw new ArgumentException("Unit cost cannot be negative", nameof(unitCost));

        var item = new SupplierReturnItem(Id, productId, batchId, quantity, unitCost, reason);
        Items.Add(item);
        RecalculateTotal();
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveItem(Guid itemId)
    {
        var item = Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new InvalidOperationException($"Item with id {itemId} not found");

        Items.Remove(item);
        RecalculateTotal();
        UpdatedAt = DateTime.UtcNow;
    }

    private void RecalculateTotal()
    {
        TotalAmount = Items.Sum(i => i.TotalCost);
    }
}

