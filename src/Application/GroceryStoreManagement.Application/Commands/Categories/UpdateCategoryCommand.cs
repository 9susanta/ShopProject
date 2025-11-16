using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Categories;

public class UpdateCategoryCommand : IRequest<CategoryDto>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid TaxSlabId { get; set; }
}

