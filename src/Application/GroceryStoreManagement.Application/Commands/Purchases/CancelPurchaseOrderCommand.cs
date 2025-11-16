using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Purchases;

public class CancelPurchaseOrderCommand : IRequest<PurchaseOrderDto>
{
    public Guid Id { get; set; }
    public string? Reason { get; set; }
}

