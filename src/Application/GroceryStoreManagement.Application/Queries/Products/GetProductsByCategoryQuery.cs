using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Products;

public class GetProductsByCategoryQuery : IRequest<List<ProductDto>>
{
    public Guid CategoryId { get; set; }
    public bool IncludeInactive { get; set; } = false;
}

