using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Purchases;

public class ApprovePurchaseOrderCommand : IRequest<PurchaseOrderDto>
{
    public Guid Id { get; set; }
}

