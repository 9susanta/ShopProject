using MediatR;

namespace GroceryStoreManagement.Domain.Events;

public class ProductImportedEvent : INotification
{
    public Guid ProductId { get; }
    public string ProductName { get; }
    public string SKU { get; }
    public string? Barcode { get; }
    public bool IsNewProduct { get; }
    public Guid ImportJobId { get; }

    public ProductImportedEvent(Guid productId, string productName, string sku, string? barcode, bool isNewProduct, Guid importJobId)
    {
        ProductId = productId;
        ProductName = productName;
        SKU = sku;
        Barcode = barcode;
        IsNewProduct = isNewProduct;
        ImportJobId = importJobId;
    }
}

