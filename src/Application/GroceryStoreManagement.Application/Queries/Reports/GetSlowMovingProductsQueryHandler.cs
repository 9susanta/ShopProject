using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Queries.Reports;

public class GetSlowMovingProductsQueryHandler : IRequestHandler<GetSlowMovingProductsQuery, SlowMovingProductsReportDto>
{
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<SaleItem> _saleItemRepository;
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly ILogger<GetSlowMovingProductsQueryHandler> _logger;

    public GetSlowMovingProductsQueryHandler(
        IRepository<Product> productRepository,
        IRepository<SaleItem> saleItemRepository,
        IRepository<InventoryEntity> inventoryRepository,
        ILogger<GetSlowMovingProductsQueryHandler> logger)
    {
        _productRepository = productRepository;
        _saleItemRepository = saleItemRepository;
        _inventoryRepository = inventoryRepository;
        _logger = logger;
    }

    public async Task<SlowMovingProductsReportDto> Handle(GetSlowMovingProductsQuery request, CancellationToken cancellationToken)
    {
        var fromDate = request.FromDate ?? DateTime.UtcNow.AddDays(-request.DaysThreshold);
        var toDate = request.ToDate ?? DateTime.UtcNow;

        var products = await _productRepository.GetAllAsync(cancellationToken);
        var saleItems = await _saleItemRepository.GetAllAsync(cancellationToken);
        var inventories = await _inventoryRepository.GetAllAsync(cancellationToken);
        var inventoryLookup = inventories.ToDictionary(i => i.ProductId);

        // Get sales within date range
        var salesInRange = saleItems
            .Where(si => si.Sale.SaleDate >= fromDate && si.Sale.SaleDate <= toDate)
            .ToList();

        var productSales = salesInRange
            .GroupBy(si => si.ProductId)
            .ToDictionary(g => g.Key, g => new
            {
                TotalQuantity = g.Sum(si => si.Quantity),
                TotalAmount = g.Sum(si => si.TotalPrice),
                LastSaleDate = g.Max(si => si.Sale.SaleDate)
            });

        var slowMovingProducts = new List<SlowMovingProductDto>();

        foreach (var product in products)
        {
            var sales = productSales.GetValueOrDefault(product.Id);
            var inventory = inventoryLookup.GetValueOrDefault(product.Id);

            if (sales == null || sales.TotalQuantity == 0)
            {
                // No sales in period
                var daysSinceLastSale = (DateTime.UtcNow - (sales?.LastSaleDate ?? product.CreatedAt)).Days;
                if (daysSinceLastSale >= request.MinDaysSinceLastSale)
                {
                    slowMovingProducts.Add(new SlowMovingProductDto
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        SKU = product.SKU,
                        CurrentStock = inventory?.QuantityOnHand ?? 0,
                        TotalSalesQuantity = 0,
                        TotalSalesAmount = 0,
                        LastSaleDate = null,
                        DaysSinceLastSale = daysSinceLastSale
                    });
                }
            }
            else if (sales.TotalQuantity < 10) // Low sales threshold
            {
                var daysSinceLastSale = (DateTime.UtcNow - sales.LastSaleDate).Days;
                if (daysSinceLastSale >= request.MinDaysSinceLastSale)
                {
                    slowMovingProducts.Add(new SlowMovingProductDto
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        SKU = product.SKU,
                        CurrentStock = inventory?.QuantityOnHand ?? 0,
                        TotalSalesQuantity = sales.TotalQuantity,
                        TotalSalesAmount = sales.TotalAmount,
                        LastSaleDate = sales.LastSaleDate,
                        DaysSinceLastSale = daysSinceLastSale
                    });
                }
            }
        }

        return new SlowMovingProductsReportDto
        {
            FromDate = fromDate,
            ToDate = toDate,
            DaysThreshold = request.DaysThreshold,
            Products = slowMovingProducts.OrderByDescending(p => p.DaysSinceLastSale).ToList()
        };
    }
}

