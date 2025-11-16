using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;
using GroceryStoreManagement.Domain.ValueObjects;

namespace GroceryStoreManagement.Domain.Entities;

public class PurchaseOrder : BaseEntity
{
    public string OrderNumber { get; private set; } = string.Empty;
    public Guid SupplierId { get; private set; }
    public PurchaseOrderStatus Status { get; private set; } = PurchaseOrderStatus.Draft;
    public DateTime OrderDate { get; private set; } = DateTime.UtcNow;
    public DateTime? ExpectedDeliveryDate { get; private set; }
    public DateTime? ReceivedDate { get; private set; }
    public decimal TotalAmount { get; private set; }

    // Navigation properties
    public virtual Supplier Supplier { get; private set; } = null!;
    public virtual ICollection<PurchaseOrderItem> Items { get; private set; } = new List<PurchaseOrderItem>();

    private PurchaseOrder() { } // EF Core

    public PurchaseOrder(string orderNumber, Guid supplierId, DateTime? expectedDeliveryDate = null)
    {
        if (string.IsNullOrWhiteSpace(orderNumber))
            throw new ArgumentException("Order number cannot be null or empty", nameof(orderNumber));

        OrderNumber = orderNumber;
        SupplierId = supplierId;
        ExpectedDeliveryDate = expectedDeliveryDate;
        Status = PurchaseOrderStatus.Draft;
    }

    public void AddItem(Guid productId, int quantity, decimal unitPrice)
    {
        if (Status != PurchaseOrderStatus.Draft)
            throw new InvalidOperationException("Cannot add items to a non-draft purchase order");

        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (unitPrice < 0)
            throw new ArgumentException("Unit price cannot be negative", nameof(unitPrice));

        var item = new PurchaseOrderItem(Id, productId, quantity, unitPrice);
        Items.Add(item);
        RecalculateTotal();
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveItem(Guid itemId)
    {
        if (Status != PurchaseOrderStatus.Draft)
            throw new InvalidOperationException("Cannot remove items from a non-draft purchase order");

        var item = Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new InvalidOperationException($"Item with id {itemId} not found");

        Items.Remove(item);
        RecalculateTotal();
        UpdatedAt = DateTime.UtcNow;
    }

    public void Submit()
    {
        if (Status != PurchaseOrderStatus.Draft)
            throw new InvalidOperationException("Only draft orders can be submitted");

        if (!Items.Any())
            throw new InvalidOperationException("Cannot submit an order without items");

        Status = PurchaseOrderStatus.Pending;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve()
    {
        if (Status != PurchaseOrderStatus.Pending)
            throw new InvalidOperationException("Only pending orders can be approved");

        Status = PurchaseOrderStatus.Approved;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Receive(DateTime receivedDate)
    {
        if (Status != PurchaseOrderStatus.Pending)
            throw new InvalidOperationException("Only pending orders can be received");

        Status = PurchaseOrderStatus.Received;
        ReceivedDate = receivedDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == PurchaseOrderStatus.Received)
            throw new InvalidOperationException("Cannot cancel a received order");

        Status = PurchaseOrderStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    private void RecalculateTotal()
    {
        TotalAmount = Items.Sum(i => i.TotalPrice);
    }
}

