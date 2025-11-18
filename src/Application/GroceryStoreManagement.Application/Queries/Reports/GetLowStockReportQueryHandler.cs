using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Queries.Reports;

public class GetLowStockReportQueryHandler : IRequestHandler<GetLowStockReportQuery, LowStockReportDto>
{
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly ILogger<GetLowStockReportQueryHandler> _logger;

    public GetLowStockReportQueryHandler(
        IRepository<Product> productRepository,
        IRepository<InventoryEntity> inventoryRepository,
        ILogger<GetLowStockReportQueryHandler> logger)
    {
        _productRepository = productRepository;
        _inventoryRepository = inventoryRepository;
        _logger = logger;
    }

    public async Task<LowStockReportDto> Handle(GetLowStockReportQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Generating low stock report with threshold: {Threshold}", request.Threshold);

        var products = await _productRepository.GetAllAsync(cancellationToken);
        var inventories = await _inventoryRepository.GetAllAsync(cancellationToken);
        var inventoryLookup = inventories.ToDictionary(i => i.ProductId);

        var threshold = request.Threshold ?? 10; // Default threshold

        var lowStockItems = products
            .Where(p => p.IsActive)
            .Select(p =>
            {
                var inventory = inventoryLookup.GetValueOrDefault(p.Id);
                var currentStock = inventory?.QuantityOnHand ?? 0;
                var stockThreshold = p.LowStockThreshold > 0 ? p.LowStockThreshold : threshold;

                return new
                {
                    Product = p,
                    CurrentStock = currentStock,
                    StockThreshold = stockThreshold,
                    IsLowStock = currentStock <= stockThreshold
                };
            })
            .Where(x => x.IsLowStock)
            .Select(x => new LowStockItemDto
            {
                ProductId = x.Product.Id,
                ProductName = x.Product.Name,
                SKU = x.Product.SKU,
                CurrentStock = x.CurrentStock,
                LowStockThreshold = x.StockThreshold,
                ReorderPoint = x.Product.ReorderPoint,
                SuggestedReorderQuantity = x.Product.SuggestedReorderQuantity,
                CategoryName = x.Product.Category?.Name ?? "Unknown"
            })
            .OrderBy(i => i.CurrentStock)
            .ToList();

        return new LowStockReportDto
        {
            GeneratedAt = DateTime.UtcNow,
            Threshold = request.Threshold,
            Items = lowStockItems
        };
    }
}

