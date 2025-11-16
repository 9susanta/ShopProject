using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Sales;

public class CreateSaleCommand : IRequest<SaleDto>
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid? CustomerId { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public List<SaleItemCommand> Items { get; set; } = new();
}

public class SaleItemCommand
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

