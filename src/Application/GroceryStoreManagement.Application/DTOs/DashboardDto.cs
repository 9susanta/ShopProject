namespace GroceryStoreManagement.Application.DTOs;

public class DashboardDto
{
    public decimal TodaySales { get; set; }
    public decimal TotalSalesThisMonth { get; set; }
    public int TotalSalesCountToday { get; set; }
    public int TotalSalesCountThisMonth { get; set; }
    public List<FastMovingProductDto> FastMovingProducts { get; set; } = new();
    public int LowStockCount { get; set; }
    public int ExpirySoonCount { get; set; }
    public List<ImportJobDto> RecentImports { get; set; } = new();
}

public class FastMovingProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal Revenue { get; set; }
}

