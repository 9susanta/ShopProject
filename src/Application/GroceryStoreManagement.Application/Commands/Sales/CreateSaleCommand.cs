using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Commands.Sales;

public class CreateSaleCommand : IRequest<SaleDto>
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid? CustomerId { get; set; }
    public string? CustomerPhone { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public decimal CashAmount { get; set; } = 0;
    public decimal UPIAmount { get; set; } = 0;
    public decimal CardAmount { get; set; } = 0;
    public decimal PayLaterAmount { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    public string? Notes { get; set; }
    public List<SaleItemCommand> Items { get; set; } = new();
}

public class SaleItemCommand
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

