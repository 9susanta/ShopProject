using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Categories;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, CategoryDto>
{
    private readonly IRepository<Category> _categoryRepository;
    private readonly IRepository<TaxSlab> _taxSlabRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateCategoryCommandHandler> _logger;

    public UpdateCategoryCommandHandler(
        IRepository<Category> categoryRepository,
        IRepository<TaxSlab> taxSlabRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateCategoryCommandHandler> logger)
    {
        _categoryRepository = categoryRepository;
        _taxSlabRepository = taxSlabRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<CategoryDto> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating category: {CategoryId}", request.Id);

        var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
        if (category == null)
            throw new InvalidOperationException($"Category with id {request.Id} not found");

        // Validate TaxSlab exists
        var taxSlab = await _taxSlabRepository.GetByIdAsync(request.TaxSlabId, cancellationToken);
        if (taxSlab == null)
            throw new InvalidOperationException($"TaxSlab with id {request.TaxSlabId} not found");

        // Check for duplicate name (excluding current category)
        var existingCategories = await _categoryRepository.GetAllAsync(cancellationToken);
        if (existingCategories.Any(c => c.Id != request.Id && c.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException($"Category with name '{request.Name}' already exists");

        category.Update(request.Name, request.TaxSlabId, request.Description);
        await _categoryRepository.UpdateAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Category updated successfully: {CategoryId}", category.Id);

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            TaxSlabId = category.TaxSlabId,
            TaxSlab = new TaxSlabDto
            {
                Id = taxSlab.Id,
                Name = taxSlab.Name,
                Rate = taxSlab.Rate,
                IsDefault = taxSlab.IsDefault,
                IsActive = taxSlab.IsActive,
                CreatedAt = taxSlab.CreatedAt,
                UpdatedAt = taxSlab.UpdatedAt
            },
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };
    }
}

