using MediatR;

namespace GroceryStoreManagement.Domain.Events;

public class LowStockEvent : INotification
{
    public Guid ProductId { get; }
    public string ProductName { get; }
    public string SKU { get; }
    public int CurrentStock { get; }
    public int Threshold { get; }

    public LowStockEvent(Guid productId, string productName, string sku, int currentStock, int threshold)
    {
        ProductId = productId;
        ProductName = productName;
        SKU = sku;
        CurrentStock = currentStock;
        Threshold = threshold;
    }
}

