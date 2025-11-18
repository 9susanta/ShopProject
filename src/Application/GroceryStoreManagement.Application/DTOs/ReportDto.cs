namespace GroceryStoreManagement.Application.DTOs;

public class DailySalesReportDto
{
    public DateTime Date { get; set; }
    public int TotalSales { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalTax { get; set; }
    public decimal TotalDiscount { get; set; }
    public decimal TotalCash { get; set; }
    public decimal TotalUPI { get; set; }
    public decimal TotalCard { get; set; }
    public decimal TotalPayLater { get; set; }
    public int TotalCustomers { get; set; }
    public List<SaleDto> Sales { get; set; } = new();
}

public class InventorySummaryDto
{
    public int TotalProducts { get; set; }
    public int LowStockProducts { get; set; }
    public int OutOfStockProducts { get; set; }
    public decimal TotalInventoryValue { get; set; }
}

public class PurchaseSummaryDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalAmount { get; set; }
    public int ReceivedOrders { get; set; }
    public int PendingOrders { get; set; }
}

