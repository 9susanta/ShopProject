using MediatR;

namespace GroceryStoreManagement.Domain.Events;

public class LoyaltyPointsEarnedEvent : INotification
{
    public Guid CustomerId { get; }
    public string CustomerPhone { get; }
    public Guid SaleId { get; }
    public string InvoiceNumber { get; }
    public int PointsEarned { get; }
    public int TotalPoints { get; }

    public LoyaltyPointsEarnedEvent(Guid customerId, string customerPhone, Guid saleId, string invoiceNumber, int pointsEarned, int totalPoints)
    {
        CustomerId = customerId;
        CustomerPhone = customerPhone;
        SaleId = saleId;
        InvoiceNumber = invoiceNumber;
        PointsEarned = pointsEarned;
        TotalPoints = totalPoints;
    }
}

