using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetInventoryByProductIdQueryHandler : IRequestHandler<GetInventoryByProductIdQuery, InventoryDto?>
{
    private readonly IRepository<Domain.Entities.Inventory> _inventoryRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetInventoryByProductIdQueryHandler> _logger;

    public GetInventoryByProductIdQueryHandler(
        IRepository<Domain.Entities.Inventory> inventoryRepository,
        IRepository<Product> productRepository,
        ICacheService cacheService,
        ILogger<GetInventoryByProductIdQueryHandler> logger)
    {
        _inventoryRepository = inventoryRepository;
        _productRepository = productRepository;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<InventoryDto?> Handle(GetInventoryByProductIdQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"inventory:product:{request.ProductId}";
        
        var cached = await _cacheService.GetAsync<InventoryDto>(cacheKey, cancellationToken);
        if (cached != null)
        {
            _logger.LogDebug("Cache hit for inventory by product: {ProductId}", request.ProductId);
            return cached;
        }

        _logger.LogDebug("Cache miss for inventory by product: {ProductId}", request.ProductId);

        var inventoryList = await _inventoryRepository.FindAsync(i => i.ProductId == request.ProductId, cancellationToken);
        var inventory = inventoryList.FirstOrDefault();
        
        if (inventory == null)
            return null;

        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
            return null;

        var result = new InventoryDto
        {
            Id = inventory.Id,
            ProductId = inventory.ProductId,
            ProductName = product.Name,
            SKU = product.SKU,
            QuantityOnHand = inventory.QuantityOnHand,
            ReservedQuantity = inventory.ReservedQuantity,
            AvailableQuantity = inventory.AvailableQuantity,
            IsLowStock = inventory.IsLowStock(product.LowStockThreshold)
        };

        // Cache for 5 minutes (inventory changes frequently)
        await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(5), cancellationToken);

        return result;
    }
}
