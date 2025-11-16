using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Domain.Entities;

/// <summary>
/// Goods Receive Note (GRN) - represents receipt of goods from supplier
/// Can be created from a Purchase Order or as an ad-hoc receipt
/// </summary>
public class GoodsReceiveNote : BaseEntity
{
    public string GRNNumber { get; private set; } = string.Empty;
    public Guid SupplierId { get; private set; }
    public Guid? PurchaseOrderId { get; private set; } // Optional - can be ad-hoc
    public GRNStatus Status { get; private set; } = GRNStatus.Draft;
    public DateTime ReceivedDate { get; private set; } = DateTime.UtcNow;
    public string? InvoiceNumber { get; private set; }
    public string? InvoiceFilePath { get; private set; } // Path to uploaded invoice file
    public decimal TotalAmount { get; private set; }
    public string? Notes { get; private set; }
    public string? IdempotencyKey { get; private set; } // For idempotent processing

    // Navigation properties
    public virtual Supplier Supplier { get; private set; } = null!;
    public virtual PurchaseOrder? PurchaseOrder { get; private set; }
    public virtual ICollection<GRNItem> Items { get; private set; } = new List<GRNItem>();

    private GoodsReceiveNote() { } // EF Core

    public GoodsReceiveNote(
        string grnNumber,
        Guid supplierId,
        DateTime receivedDate,
        Guid? purchaseOrderId = null,
        string? invoiceNumber = null,
        string? invoiceFilePath = null,
        string? notes = null,
        string? idempotencyKey = null)
    {
        if (string.IsNullOrWhiteSpace(grnNumber))
            throw new ArgumentException("GRN number cannot be null or empty", nameof(grnNumber));

        GRNNumber = grnNumber;
        SupplierId = supplierId;
        PurchaseOrderId = purchaseOrderId;
        ReceivedDate = receivedDate;
        InvoiceNumber = invoiceNumber;
        InvoiceFilePath = invoiceFilePath;
        Notes = notes;
        IdempotencyKey = idempotencyKey;
        Status = GRNStatus.Draft;
    }

    public void AddItem(
        Guid productId,
        int quantity,
        decimal unitCost,
        DateTime? expiryDate = null,
        string? batchNumber = null)
    {
        if (Status != GRNStatus.Draft)
            throw new InvalidOperationException("Cannot add items to a non-draft GRN");

        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (unitCost < 0)
            throw new ArgumentException("Unit cost cannot be negative", nameof(unitCost));

        var item = new GRNItem(Id, productId, quantity, unitCost, expiryDate, batchNumber);
        Items.Add(item);
        RecalculateTotal();
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveItem(Guid itemId)
    {
        if (Status != GRNStatus.Draft)
            throw new InvalidOperationException("Cannot remove items from a non-draft GRN");

        var item = Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new InvalidOperationException($"Item with id {itemId} not found");

        Items.Remove(item);
        RecalculateTotal();
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateInvoice(string invoiceNumber, string invoiceFilePath)
    {
        if (Status != GRNStatus.Draft)
            throw new InvalidOperationException("Cannot update invoice for a non-draft GRN");

        InvoiceNumber = invoiceNumber;
        InvoiceFilePath = invoiceFilePath;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Confirm()
    {
        if (Status != GRNStatus.Draft)
            throw new InvalidOperationException("Only draft GRNs can be confirmed");

        if (!Items.Any())
            throw new InvalidOperationException("Cannot confirm a GRN without items");

        Status = GRNStatus.Confirmed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == GRNStatus.Confirmed)
            throw new InvalidOperationException("Cannot cancel a confirmed GRN. Use return-to-supplier instead.");

        Status = GRNStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Void()
    {
        if (Status != GRNStatus.Confirmed)
            throw new InvalidOperationException("Only confirmed GRNs can be voided");

        Status = GRNStatus.Voided;
        UpdatedAt = DateTime.UtcNow;
    }

    private void RecalculateTotal()
    {
        TotalAmount = Items.Sum(i => i.TotalCost);
    }
}

