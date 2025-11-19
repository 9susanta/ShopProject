namespace GroceryStoreManagement.Application.DTOs;

public class PayLaterLedgerEntryDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty; // Sale, Payment
    public decimal Amount { get; set; }
    public decimal BalanceAfter { get; set; }
    public Guid? SaleId { get; set; }
    public string? SaleInvoiceNumber { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}

