using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetInventoryValuationQueryHandler : IRequestHandler<GetInventoryValuationQuery, InventoryValuationDto>
{
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly IRepository<InventoryBatch> _batchRepository;
    private readonly ILogger<GetInventoryValuationQueryHandler> _logger;

    public GetInventoryValuationQueryHandler(
        IRepository<Product> productRepository,
        IRepository<InventoryEntity> inventoryRepository,
        IRepository<InventoryBatch> batchRepository,
        ILogger<GetInventoryValuationQueryHandler> logger)
    {
        _productRepository = productRepository;
        _inventoryRepository = inventoryRepository;
        _batchRepository = batchRepository;
        _logger = logger;
    }

    public async Task<InventoryValuationDto> Handle(GetInventoryValuationQuery request, CancellationToken cancellationToken)
    {
        var method = request.Method.ToUpperInvariant();
        if (method != "FIFO" && method != "LIFO")
        {
            method = "FIFO"; // Default to FIFO
        }

        var allProducts = await _productRepository.GetAllAsync(cancellationToken);
        var allInventories = await _inventoryRepository.GetAllAsync(cancellationToken);
        var allBatches = await _batchRepository.GetAllAsync(cancellationToken);

        // Filter products if specific product requested
        var products = allProducts.Where(p => p.IsActive);
        if (request.ProductId.HasValue)
        {
            products = products.Where(p => p.Id == request.ProductId.Value);
        }

        var productValuations = new List<ProductValuationDto>();
        decimal totalValue = 0;
        int totalQuantity = 0;

        foreach (var product in products)
        {
            var inventory = allInventories.FirstOrDefault(i => i.ProductId == product.Id);
            if (inventory == null || inventory.AvailableQuantity <= 0)
                continue;

            var batches = allBatches
                .Where(b => b.ProductId == product.Id && b.IsActive && b.AvailableQuantity > 0)
                .ToList();

            if (!batches.Any())
                continue;

            // Sort batches based on method
            var sortedBatches = method == "FIFO"
                ? batches.OrderBy(b => b.ReceivedDate).ThenBy(b => b.ExpiryDate ?? DateTime.MaxValue).ToList()
                : batches.OrderByDescending(b => b.ReceivedDate).ThenByDescending(b => b.ExpiryDate ?? DateTime.MinValue).ToList();

            var batchValuations = new List<BatchValuationDto>();
            int remainingQuantity = inventory.AvailableQuantity;

            foreach (var batch in sortedBatches)
            {
                if (remainingQuantity <= 0)
                    break;

                var quantityToUse = Math.Min(batch.AvailableQuantity, remainingQuantity);
                var batchValue = quantityToUse * batch.UnitCost;

                batchValuations.Add(new BatchValuationDto
                {
                    BatchId = batch.Id,
                    BatchNumber = batch.BatchNumber ?? string.Empty,
                    Quantity = quantityToUse,
                    UnitCost = batch.UnitCost,
                    TotalValue = batchValue,
                    ReceivedDate = batch.ReceivedDate,
                    ExpiryDate = batch.ExpiryDate
                });

                remainingQuantity -= quantityToUse;
            }

            if (batchValuations.Any())
            {
                var productValue = batchValuations.Sum(b => b.TotalValue);
                var productQuantity = batchValuations.Sum(b => b.Quantity);
                var averageUnitCost = productQuantity > 0 ? productValue / productQuantity : 0;

                productValuations.Add(new ProductValuationDto
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    ProductSKU = product.SKU,
                    Quantity = productQuantity,
                    UnitCost = averageUnitCost,
                    TotalValue = productValue,
                    BatchValuations = batchValuations
                });

                totalValue += productValue;
                totalQuantity += productQuantity;
            }
        }

        _logger.LogInformation("Inventory valuation calculated using {Method}: Total Value = {TotalValue}, Total Quantity = {TotalQuantity}",
            method, totalValue, totalQuantity);

        return new InventoryValuationDto
        {
            Method = method,
            TotalValue = totalValue,
            TotalQuantity = totalQuantity,
            ProductValuations = productValuations,
            CalculatedAt = DateTime.UtcNow
        };
    }
}

