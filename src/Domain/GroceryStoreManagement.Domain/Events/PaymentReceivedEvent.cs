using MediatR;

namespace GroceryStoreManagement.Domain.Events;

public class PaymentReceivedEvent : INotification
{
    public Guid CustomerId { get; }
    public string CustomerPhone { get; }
    public decimal Amount { get; }
    public string PaymentMethod { get; }
    public DateTime PaymentDate { get; }
    public string? ReferenceNumber { get; }

    public PaymentReceivedEvent(Guid customerId, string customerPhone, decimal amount, string paymentMethod, DateTime paymentDate, string? referenceNumber = null)
    {
        CustomerId = customerId;
        CustomerPhone = customerPhone;
        Amount = amount;
        PaymentMethod = paymentMethod;
        PaymentDate = paymentDate;
        ReferenceNumber = referenceNumber;
    }
}

