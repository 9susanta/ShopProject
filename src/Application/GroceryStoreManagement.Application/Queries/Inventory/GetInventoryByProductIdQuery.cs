using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetInventoryByProductIdQuery : IRequest<InventoryDto?>
{
    public Guid ProductId { get; set; }
}

