namespace GroceryStoreManagement.Application.DTOs;

public class AccountingLedgerEntryDto
{
    public Guid Id { get; set; }
    public string EntryType { get; set; } = string.Empty; // Purchase, Sale, PayLaterPayment, Expense, Income
    public DateTime EntryDate { get; set; }
    public decimal Amount { get; set; }
    public string? Reference { get; set; } // Invoice number, PO number, etc.
    public Guid? ReferenceId { get; set; } // Sale ID, PO ID, etc.
    public string? Description { get; set; }
    public decimal? GSTAmount { get; set; }
    public decimal? CGSTAmount { get; set; }
    public decimal? SGSTAmount { get; set; }
    public string? CustomerName { get; set; }
    public string? SupplierName { get; set; }
    public DateTime CreatedAt { get; set; }
}

