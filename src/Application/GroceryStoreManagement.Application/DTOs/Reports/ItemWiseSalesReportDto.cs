namespace GroceryStoreManagement.Application.DTOs;

public class ItemWiseSalesReportDto
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public List<ItemWiseSalesItemDto> Items { get; set; } = new();
    public decimal TotalSalesAmount { get; set; }
    public int TotalQuantitySold { get; set; }
}

public class ItemWiseSalesItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AveragePrice { get; set; }
    public int NumberOfTransactions { get; set; }
}

