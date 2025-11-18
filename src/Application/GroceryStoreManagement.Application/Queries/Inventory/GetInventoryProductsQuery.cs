using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetInventoryProductsQuery : IRequest<ProductInventoryListResponseDto>
{
    public string? Search { get; set; }
    public Guid? CategoryId { get; set; }
    public bool? LowStock { get; set; }
    public bool? ExpirySoon { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

