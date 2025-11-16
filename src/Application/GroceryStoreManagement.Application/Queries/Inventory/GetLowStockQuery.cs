using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetLowStockQuery : IRequest<List<InventoryDto>>
{
    public int? Threshold { get; set; } // Optional override threshold
}

