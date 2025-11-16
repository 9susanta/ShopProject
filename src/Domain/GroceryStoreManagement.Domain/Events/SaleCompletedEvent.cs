using MediatR;

namespace GroceryStoreManagement.Domain.Events;

public class SaleCompletedEvent : INotification
{
    public Guid SaleId { get; }
    public string InvoiceNumber { get; }
    public DateTime SaleDate { get; }
    public decimal TotalAmount { get; }
    public List<SaleItem> Items { get; }

    public SaleCompletedEvent(Guid saleId, string invoiceNumber, DateTime saleDate, decimal totalAmount, List<SaleItem> items)
    {
        SaleId = saleId;
        InvoiceNumber = invoiceNumber;
        SaleDate = saleDate;
        TotalAmount = totalAmount;
        Items = items;
    }

    public record SaleItem(Guid ProductId, int Quantity, decimal UnitPrice);
}

