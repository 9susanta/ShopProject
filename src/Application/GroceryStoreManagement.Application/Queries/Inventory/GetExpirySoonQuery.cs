using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetExpirySoonQuery : IRequest<List<InventoryDto>>
{
    public int DaysThreshold { get; set; } = 7;
}

