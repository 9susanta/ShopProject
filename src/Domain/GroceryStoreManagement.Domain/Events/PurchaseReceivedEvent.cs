using MediatR;

namespace GroceryStoreManagement.Domain.Events;

public class PurchaseReceivedEvent : INotification
{
    public Guid PurchaseOrderId { get; }
    public string OrderNumber { get; }
    public DateTime ReceivedDate { get; }
    public List<PurchaseItem> Items { get; }

    public PurchaseReceivedEvent(Guid purchaseOrderId, string orderNumber, DateTime receivedDate, List<PurchaseItem> items)
    {
        PurchaseOrderId = purchaseOrderId;
        OrderNumber = orderNumber;
        ReceivedDate = receivedDate;
        Items = items;
    }

    public record PurchaseItem(Guid ProductId, int Quantity, decimal UnitPrice);
}

