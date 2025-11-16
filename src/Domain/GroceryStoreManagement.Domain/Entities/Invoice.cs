using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

public class Invoice : BaseEntity
{
    public Guid SaleId { get; private set; }
    public string InvoiceNumber { get; private set; } = string.Empty;
    public DateTime InvoiceDate { get; private set; } = DateTime.UtcNow;
    public decimal SubTotal { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TotalAmount { get; private set; }

    // Navigation properties
    public virtual Sale Sale { get; private set; } = null!;

    private Invoice() { } // EF Core

    public Invoice(Guid saleId, string invoiceNumber, decimal subTotal, decimal taxAmount, decimal discountAmount, decimal totalAmount)
    {
        if (string.IsNullOrWhiteSpace(invoiceNumber))
            throw new ArgumentException("Invoice number cannot be null or empty", nameof(invoiceNumber));

        SaleId = saleId;
        InvoiceNumber = invoiceNumber;
        SubTotal = subTotal;
        TaxAmount = taxAmount;
        DiscountAmount = discountAmount;
        TotalAmount = totalAmount;
    }
}

