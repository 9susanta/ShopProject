using MediatR;

namespace GroceryStoreManagement.Domain.Events;

public class StockDecreasedEvent : INotification
{
    public Guid ProductId { get; }
    public Guid InventoryId { get; }
    public int QuantityRemoved { get; }
    public int NewQuantity { get; }
    public string Reason { get; }

    public StockDecreasedEvent(Guid productId, Guid inventoryId, int quantityRemoved, int newQuantity, string reason)
    {
        ProductId = productId;
        InventoryId = inventoryId;
        QuantityRemoved = quantityRemoved;
        NewQuantity = newQuantity;
        Reason = reason;
    }
}

