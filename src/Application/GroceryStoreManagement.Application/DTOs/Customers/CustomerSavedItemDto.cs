namespace GroceryStoreManagement.Application.DTOs;

public class CustomerSavedItemDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSKU { get; set; } = string.Empty;
    public decimal? ProductPrice { get; set; }
    public int PurchaseCount { get; set; }
    public DateTime LastPurchasedAt { get; set; }
    public bool IsFavorite { get; set; }
    public DateTime CreatedAt { get; set; }
}

