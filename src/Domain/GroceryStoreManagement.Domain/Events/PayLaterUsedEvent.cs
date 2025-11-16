using MediatR;

namespace GroceryStoreManagement.Domain.Events;

public class PayLaterUsedEvent : INotification
{
    public Guid CustomerId { get; }
    public string CustomerPhone { get; }
    public Guid SaleId { get; }
    public string InvoiceNumber { get; }
    public decimal Amount { get; }
    public decimal NewBalance { get; }

    public PayLaterUsedEvent(Guid customerId, string customerPhone, Guid saleId, string invoiceNumber, decimal amount, decimal newBalance)
    {
        CustomerId = customerId;
        CustomerPhone = customerPhone;
        SaleId = saleId;
        InvoiceNumber = invoiceNumber;
        Amount = amount;
        NewBalance = newBalance;
    }
}

