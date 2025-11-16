using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;
using System.Linq;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetLowStockQueryHandler : IRequestHandler<GetLowStockQuery, List<LowStockProductDto>>
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

    public async Task<List<LowStockProductDto>> Handle(GetLowStockQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching low stock products");

        var allInventories = await _inventoryRepository.GetAllAsync(cancellationToken);
        var allProducts = await _productRepository.GetAllAsync(cancellationToken);

        var lowStockProducts = new List<LowStockProductDto>();

        foreach (var inventory in allInventories)
        {
            var product = allProducts.FirstOrDefault(p => p.Id == inventory.ProductId);
            if (product == null || !product.IsActive)
                continue;

            var threshold = request.Threshold ?? product.LowStockThreshold;
            
            if (inventory.IsLowStock(threshold))
            {
                lowStockProducts.Add(new LowStockProductDto
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    SKU = product.SKU,
                    AvailableQuantity = inventory.AvailableQuantity,
                    LowStockThreshold = threshold,
                    Shortage = threshold - inventory.AvailableQuantity
                });
            }
        }

        return lowStockProducts.OrderBy(p => p.Shortage).ToList();
    }
}
