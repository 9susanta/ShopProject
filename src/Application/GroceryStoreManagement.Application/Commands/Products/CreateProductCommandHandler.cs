using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;
using UnitEntity = GroceryStoreManagement.Domain.Entities.Unit;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Commands.Products;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<Category> _categoryRepository;
    private readonly IRepository<UnitEntity> _unitRepository;
    private readonly IRepository<TaxSlab> _taxSlabRepository;
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cacheService;
    private readonly ILogger<CreateProductCommandHandler> _logger;

    public CreateProductCommandHandler(
        IRepository<Product> productRepository,
        IRepository<Category> categoryRepository,
        IRepository<UnitEntity> unitRepository,
        IRepository<TaxSlab> taxSlabRepository,
        IRepository<InventoryEntity> inventoryRepository,
        IUnitOfWork unitOfWork,
        ICacheService cacheService,
        ILogger<CreateProductCommandHandler> logger)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _unitRepository = unitRepository;
        _taxSlabRepository = taxSlabRepository;
        _inventoryRepository = inventoryRepository;
        _unitOfWork = unitOfWork;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating product: {ProductName}", request.Name);

        var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
        if (category == null)
            throw new InvalidOperationException($"Category with id {request.CategoryId} not found");

        var unit = await _unitRepository.GetByIdAsync(request.UnitId, cancellationToken);
        if (unit == null)
            throw new InvalidOperationException($"Unit with id {request.UnitId} not found");

        // Auto-fill TaxSlabId from Category if not provided
        var taxSlabId = request.TaxSlabId ?? category.TaxSlabId;
        
        var taxSlab = await _taxSlabRepository.GetByIdAsync(taxSlabId, cancellationToken);
        if (taxSlab == null)
            throw new InvalidOperationException($"Tax slab with id {taxSlabId} not found");

        // Validate barcode uniqueness if provided
        if (!string.IsNullOrWhiteSpace(request.Barcode))
        {
            var allProducts = await _productRepository.GetAllAsync(cancellationToken);
            if (allProducts.Any(p => p.Barcode != null && p.Barcode.Equals(request.Barcode, StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException($"Product with barcode '{request.Barcode}' already exists");
        }

        var product = new Product(
            request.Name,
            request.SKU,
            request.MRP,
            request.SalePrice,
            request.CategoryId,
            request.UnitId,
            request.Description,
            request.Barcode,
            request.ImageUrl,
            request.LowStockThreshold,
            request.IsWeightBased,
            request.WeightPerUnit,
            taxSlabId);

        await _productRepository.AddAsync(product, cancellationToken);

        // Create initial inventory
        var inventory = new InventoryEntity(product.Id, 0);
        await _inventoryRepository.AddAsync(inventory, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Invalidate product caches
        await _cacheService.RemoveByPatternAsync("products:*", cancellationToken);
        await _cacheService.RemoveByPatternAsync("repo:Product:*", cancellationToken);
        if (!string.IsNullOrWhiteSpace(product.Barcode))
        {
            await _cacheService.RemoveAsync($"product:barcode:{product.Barcode}", cancellationToken);
        }

        _logger.LogInformation("Product created successfully: {ProductId}", product.Id);

        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            SKU = product.SKU,
            UnitPrice = product.SalePrice, // Use SalePrice for backward compatibility
            CategoryId = product.CategoryId,
            CategoryName = category.Name,
            LowStockThreshold = product.LowStockThreshold,
            IsActive = product.IsActive
        };
    }
}

