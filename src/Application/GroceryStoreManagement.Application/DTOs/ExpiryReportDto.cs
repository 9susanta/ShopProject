namespace GroceryStoreManagement.Application.DTOs;

public class ExpiryReportDto
{
    public DateTime GeneratedAt { get; set; }
    public int DaysThreshold { get; set; }
    public List<ExpiryItemDto> Items { get; set; } = new();
}

public class ExpiryItemDto
{
    public Guid BatchId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string BatchNumber { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public DateTime ExpiryDate { get; set; }
    public int DaysUntilExpiry { get; set; }
    public bool IsExpired { get; set; }
}

