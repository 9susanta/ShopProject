namespace GroceryStoreManagement.Application.DTOs;

public class InventoryValuationDto
{
    public string Method { get; set; } = string.Empty;
    public decimal TotalValue { get; set; }
    public int TotalQuantity { get; set; }
    public List<ProductValuationDto> ProductValuations { get; set; } = new();
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
}

public class ProductValuationDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSKU { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalValue { get; set; }
    public List<BatchValuationDto> BatchValuations { get; set; } = new();
}

public class BatchValuationDto
{
    public Guid BatchId { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalValue { get; set; }
    public DateTime ReceivedDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

