using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Categories;

public class GetCategoriesQuery : IRequest<List<CategoryDto>>
{
    public bool? IsActive { get; set; } // null = all, true = active only, false = inactive only
}

