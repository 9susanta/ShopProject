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

public class PurchaseSummaryReportDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalPurchaseOrders { get; set; }
    public int TotalGRNs { get; set; }
    public decimal TotalPurchaseAmount { get; set; }
    public decimal TotalPaidAmount { get; set; }
    public decimal TotalPendingAmount { get; set; }
    public int TotalItemsPurchased { get; set; }
    public List<PurchaseSummaryItemDto> Purchases { get; set; } = new();
}

public class PurchaseSummaryItemDto
{
    public DateTime Date { get; set; }
    public string PurchaseOrderNumber { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal PendingAmount { get; set; }
    public string Status { get; set; } = string.Empty;
}

