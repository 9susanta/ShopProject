using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Commands.Sales;

public class CreatePOSSaleCommand : IRequest<SaleDto>
{
    public string? CustomerPhone { get; set; } // Phone number as unique ID
    public Guid? CustomerId { get; set; } // If customer already exists
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public decimal CashAmount { get; set; } = 0;
    public decimal UPIAmount { get; set; } = 0;
    public decimal CardAmount { get; set; } = 0;
    public decimal PayLaterAmount { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    public decimal PackingCharges { get; set; } = 0;
    public bool IsHomeDelivery { get; set; } = false;
    public string? DeliveryAddress { get; set; }
    public decimal LoyaltyPointsToRedeem { get; set; } = 0;
    public string? CouponCode { get; set; }
    public List<POSSaleItemCommand> Items { get; set; } = new();
}

public class POSSaleItemCommand
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal? OverridePrice { get; set; } // For manual price override
    public string? Barcode { get; set; } // For barcode scanning
}

