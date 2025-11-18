using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Sales;

public class CreateSaleReturnCommand : IRequest<SaleReturnDto>
{
    public Guid SaleId { get; set; }
    public DateTime ReturnDate { get; set; } = DateTime.UtcNow;
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public List<SaleReturnItemCommand> Items { get; set; } = new();
}

public class SaleReturnItemCommand
{
    public Guid SaleItemId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string Reason { get; set; } = string.Empty;
}


