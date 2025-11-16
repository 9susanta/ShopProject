using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Products;

public class SearchProductsQuery : IRequest<List<ProductDto>>
{
    public string? SearchTerm { get; set; }
    public string? Barcode { get; set; }
    public Guid? CategoryId { get; set; }
    public int MaxResults { get; set; } = 50;
}

