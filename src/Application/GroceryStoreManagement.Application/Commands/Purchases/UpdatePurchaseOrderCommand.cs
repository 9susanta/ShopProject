using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Purchases;

public class UpdatePurchaseOrderCommand : IRequest<PurchaseOrderDto>
{
    public Guid Id { get; set; }
    public Guid SupplierId { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public List<UpdatePurchaseOrderItemDto> Items { get; set; } = new();
}

public class UpdatePurchaseOrderItemDto
{
    public Guid? Id { get; set; } // For existing items
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

