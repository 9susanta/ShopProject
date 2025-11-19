namespace GroceryStoreManagement.Application.DTOs;

public class SlowMovingProductsReportDto
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public int DaysThreshold { get; set; }
    public List<SlowMovingProductDto> Products { get; set; } = new();
}

public class SlowMovingProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int TotalSalesQuantity { get; set; }
    public decimal TotalSalesAmount { get; set; }
    public DateTime? LastSaleDate { get; set; }
    public int DaysSinceLastSale { get; set; }
}

