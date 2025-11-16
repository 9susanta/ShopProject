using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Purchases;

public class GetPurchaseOrderByIdQuery : IRequest<PurchaseOrderDto?>
{
    public Guid Id { get; set; }
}

