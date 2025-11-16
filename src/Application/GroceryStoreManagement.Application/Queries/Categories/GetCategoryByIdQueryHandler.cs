using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Queries.Categories;

public class GetCategoryByIdQueryHandler : IRequestHandler<GetCategoryByIdQuery, CategoryDto?>
{
    private readonly IRepository<Category> _categoryRepository;
    private readonly IRepository<TaxSlab> _taxSlabRepository;

    public GetCategoryByIdQueryHandler(
        IRepository<Category> categoryRepository,
        IRepository<TaxSlab> taxSlabRepository)
    {
        _categoryRepository = categoryRepository;
        _taxSlabRepository = taxSlabRepository;
    }

    public async Task<CategoryDto?> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
        if (category == null)
            return null;

        var taxSlab = await _taxSlabRepository.GetByIdAsync(category.TaxSlabId, cancellationToken);

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            TaxSlabId = category.TaxSlabId,
            TaxSlab = taxSlab != null ? new TaxSlabDto
            {
                Id = taxSlab.Id,
                Name = taxSlab.Name,
                Rate = taxSlab.Rate,
                IsDefault = taxSlab.IsDefault,
                IsActive = taxSlab.IsActive,
                CreatedAt = taxSlab.CreatedAt,
                UpdatedAt = taxSlab.UpdatedAt
            } : null,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };
    }
}

