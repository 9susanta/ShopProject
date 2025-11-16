using MediatR;

namespace GroceryStoreManagement.Domain.Events;

public class ExpirySoonEvent : INotification
{
    public Guid ProductId { get; }
    public string ProductName { get; }
    public string SKU { get; }
    public DateTime ExpiryDate { get; }
    public int DaysUntilExpiry { get; }

    public ExpirySoonEvent(Guid productId, string productName, string sku, DateTime expiryDate, int daysUntilExpiry)
    {
        ProductId = productId;
        ProductName = productName;
        SKU = sku;
        ExpiryDate = expiryDate;
        DaysUntilExpiry = daysUntilExpiry;
    }
}

