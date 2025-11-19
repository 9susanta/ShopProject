namespace GroceryStoreManagement.Application.DTOs;

public class LowStockReportDto
{
    public DateTime GeneratedAt { get; set; }
    public int? Threshold { get; set; }
    public List<LowStockItemDto> Items { get; set; } = new();
}

public class LowStockItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int LowStockThreshold { get; set; }
    public int ReorderPoint { get; set; }
    public int SuggestedReorderQuantity { get; set; }
    public string CategoryName { get; set; } = string.Empty;
}

