using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Categories;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, CategoryDto>
{
    private readonly IRepository<Category> _categoryRepository;
    private readonly IRepository<TaxSlab> _taxSlabRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateCategoryCommandHandler> _logger;

    public CreateCategoryCommandHandler(
        IRepository<Category> categoryRepository,
        IRepository<TaxSlab> taxSlabRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateCategoryCommandHandler> logger)
    {
        _categoryRepository = categoryRepository;
        _taxSlabRepository = taxSlabRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<CategoryDto> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating category: {CategoryName}", request.Name);

        // Validate TaxSlab exists
        var taxSlab = await _taxSlabRepository.GetByIdAsync(request.TaxSlabId, cancellationToken);
        if (taxSlab == null)
            throw new InvalidOperationException($"TaxSlab with id {request.TaxSlabId} not found");

        // Check for duplicate name
        var existingCategories = await _categoryRepository.GetAllAsync(cancellationToken);
        if (existingCategories.Any(c => c.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException($"Category with name '{request.Name}' already exists");

        var category = new Category(request.Name, request.TaxSlabId, request.Description);
        await _categoryRepository.AddAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Category created successfully: {CategoryId}", category.Id);

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

