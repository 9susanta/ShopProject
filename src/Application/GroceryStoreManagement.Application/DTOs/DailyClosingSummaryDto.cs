namespace GroceryStoreManagement.Application.DTOs;

public class DailyClosingSummaryDto
{
    public DateTime Date { get; set; }
    public decimal TotalSales { get; set; }
    public decimal TotalPurchases { get; set; }
    public decimal TotalPayLaterPayments { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalGSTCollected { get; set; }
    public decimal TotalGSTPaid { get; set; }
    public decimal NetCash { get; set; }
    public decimal NetUPI { get; set; }
    public decimal NetCard { get; set; }
    public decimal NetPayLater { get; set; }
    public int TotalTransactions { get; set; }
    public int TotalCustomers { get; set; }
    public List<AccountingLedgerEntryDto> Entries { get; set; } = new();
}

