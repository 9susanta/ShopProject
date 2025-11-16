using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Categories;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, List<CategoryDto>>
{
    private readonly IRepository<Category> _categoryRepository;
    private readonly IRepository<TaxSlab> _taxSlabRepository;
    private readonly ILogger<GetCategoriesQueryHandler> _logger;

    public GetCategoriesQueryHandler(
        IRepository<Category> categoryRepository,
        IRepository<TaxSlab> taxSlabRepository,
        ILogger<GetCategoriesQueryHandler> logger)
    {
        _categoryRepository = categoryRepository;
        _taxSlabRepository = taxSlabRepository;
        _logger = logger;
    }

    public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var allCategories = await _categoryRepository.GetAllAsync(cancellationToken);
        var allTaxSlabs = await _taxSlabRepository.GetAllAsync(cancellationToken);
        var taxSlabLookup = allTaxSlabs.ToDictionary(ts => ts.Id);

        var categories = allCategories.AsQueryable();

        // Filter by active status
        if (request.IsActive.HasValue)
        {
            categories = categories.Where(c => c.IsActive == request.IsActive.Value);
        }

        var categoryList = categories.ToList();

        return categoryList.Select(c =>
        {
            taxSlabLookup.TryGetValue(c.TaxSlabId, out var taxSlab);
            return new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                TaxSlabId = c.TaxSlabId,
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
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            };
        }).ToList();
    }
}

