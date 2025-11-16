using MediatR;

namespace GroceryStoreManagement.Domain.Events;

public class PurchaseCreatedEvent : INotification
{
    public Guid PurchaseOrderId { get; }
    public string OrderNumber { get; }
    public Guid SupplierId { get; }
    public DateTime OrderDate { get; }
    public List<PurchaseItem> Items { get; }

    public PurchaseCreatedEvent(Guid purchaseOrderId, string orderNumber, Guid supplierId, DateTime orderDate, List<PurchaseItem> items)
    {
        PurchaseOrderId = purchaseOrderId;
        OrderNumber = orderNumber;
        SupplierId = supplierId;
        OrderDate = orderDate;
        Items = items;
    }

    public record PurchaseItem(Guid ProductId, int Quantity, decimal UnitPrice);
}

