using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Categories;

public class GetCategoryByIdQuery : IRequest<CategoryDto?>
{
    public Guid Id { get; set; }
}

