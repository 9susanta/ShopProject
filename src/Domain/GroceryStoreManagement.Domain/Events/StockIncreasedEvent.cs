using MediatR;

namespace GroceryStoreManagement.Domain.Events;

public class StockIncreasedEvent : INotification
{
    public Guid ProductId { get; }
    public Guid InventoryId { get; }
    public int QuantityAdded { get; }
    public int NewQuantity { get; }
    public string Reason { get; }

    public StockIncreasedEvent(Guid productId, Guid inventoryId, int quantityAdded, int newQuantity, string reason)
    {
        ProductId = productId;
        InventoryId = inventoryId;
        QuantityAdded = quantityAdded;
        NewQuantity = newQuantity;
        Reason = reason;
    }
}

