using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Purchasing;

public class CreateSupplierReturnCommand : IRequest<SupplierReturnDto>
{
    public Guid SupplierId { get; set; }
    public Guid? GRNId { get; set; }
    public DateTime ReturnDate { get; set; } = DateTime.UtcNow;
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public List<CreateSupplierReturnItemCommand> Items { get; set; } = new();
}

public class CreateSupplierReturnItemCommand
{
    public Guid ProductId { get; set; }
    public Guid? BatchId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public string Reason { get; set; } = string.Empty;
}



