using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Products;

/// <summary>
/// Query for getting paginated list of products with filters
/// </summary>
public class GetProductsQuery : IRequest<ProductListResponseDto>
{
    public string? Search { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? SupplierId { get; set; }
    public bool? LowStock { get; set; }
    public bool? IsActive { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; } // "asc" or "desc"
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

