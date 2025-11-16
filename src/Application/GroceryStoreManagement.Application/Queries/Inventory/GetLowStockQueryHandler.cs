using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetLowStockQueryHandler : IRequestHandler<GetLowStockQuery, List<InventoryDto>>
{
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly ILogger<GetLowStockQueryHandler> _logger;

    public GetLowStockQueryHandler(
        IRepository<InventoryEntity> inventoryRepository,
        IRepository<Product> productRepository,
        ILogger<GetLowStockQueryHandler> logger)
    {
        _inventoryRepository = inventoryRepository;
        _productRepository = productRepository;
        _logger = logger;
    }

    public async Task<List<InventoryDto>> Handle(GetLowStockQuery request, CancellationToken cancellationToken)
    {
        var allInventories = await _inventoryRepository.GetAllAsync(cancellationToken);
        var allProducts = await _productRepository.GetAllAsync(cancellationToken);
        var productDict = allProducts.ToDictionary(p => p.Id);

        var lowStockInventories = allInventories
            .Where(i => productDict.ContainsKey(i.ProductId))
            .Where(i =>
            {
                var product = productDict[i.ProductId];
                var threshold = request.Threshold ?? product.LowStockThreshold;
                return i.IsLowStock(threshold);
            })
            .Select(i =>
            {
                var product = productDict[i.ProductId];
                return new InventoryDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = product.Name,
                    SKU = product.SKU,
                    QuantityOnHand = i.QuantityOnHand,
                    ReservedQuantity = i.ReservedQuantity,
                    AvailableQuantity = i.AvailableQuantity,
                    IsLowStock = true
                };
            })
            .OrderBy(i => i.AvailableQuantity)
            .ToList();

        return lowStockInventories;
    }
}

