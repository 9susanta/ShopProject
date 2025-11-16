using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Queries.Dashboard;

public class GetDashboardQueryHandler : IRequestHandler<GetDashboardQuery, DashboardDto>
{
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly IRepository<ImportJob> _importJobRepository;
    private readonly ILogger<GetDashboardQueryHandler> _logger;

    public GetDashboardQueryHandler(
        IRepository<Sale> saleRepository,
        IRepository<Product> productRepository,
        IRepository<InventoryEntity> inventoryRepository,
        IRepository<ImportJob> importJobRepository,
        ILogger<GetDashboardQueryHandler> logger)
    {
        _saleRepository = saleRepository;
        _productRepository = productRepository;
        _inventoryRepository = inventoryRepository;
        _importJobRepository = importJobRepository;
        _logger = logger;
    }

    public async Task<DashboardDto> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching dashboard data");

        var today = DateTime.UtcNow.Date;
        var monthStart = new DateTime(today.Year, today.Month, 1);

        // Get today's sales
        var allSales = await _saleRepository.GetAllAsync(cancellationToken);
        var todaySales = allSales
            .Where(s => s.SaleDate.Date == today && s.Status == SaleStatus.Completed)
            .ToList();

        var todaySalesAmount = todaySales.Sum(s => s.TotalAmount);
        var todaySalesCount = todaySales.Count;

        // Get this month's sales
        var monthSales = allSales
            .Where(s => s.SaleDate >= monthStart && s.Status == SaleStatus.Completed)
            .ToList();

        var monthSalesAmount = monthSales.Sum(s => s.TotalAmount);
        var monthSalesCount = monthSales.Count;

        // Get fast-moving products (top 10 by quantity sold)
        var allSaleItems = monthSales.SelectMany(s => s.Items).ToList();
        var productSales = allSaleItems
            .GroupBy(si => si.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                QuantitySold = g.Sum(si => si.Quantity),
                Revenue = g.Sum(si => si.TotalPrice)
            })
            .OrderByDescending(x => x.QuantitySold)
            .Take(10)
            .ToList();

        var productIds = productSales.Select(p => p.ProductId).ToList();
        var products = (await _productRepository.GetAllAsync(cancellationToken))
            .Where(p => productIds.Contains(p.Id))
            .ToDictionary(p => p.Id);

        var fastMovingProducts = productSales.Select(p => new FastMovingProductDto
        {
            ProductId = p.ProductId,
            ProductName = products.ContainsKey(p.ProductId) ? products[p.ProductId].Name : "Unknown",
            SKU = products.ContainsKey(p.ProductId) ? products[p.ProductId].SKU : "",
            QuantitySold = p.QuantitySold,
            Revenue = p.Revenue
        }).ToList();

        // Get low stock count
        var allInventories = await _inventoryRepository.GetAllAsync(cancellationToken);
        var allProducts = await _productRepository.GetAllAsync(cancellationToken);
        var productDict = allProducts.ToDictionary(p => p.Id);

        var lowStockCount = allInventories.Count(i => 
            productDict.ContainsKey(i.ProductId) && 
            i.IsLowStock(productDict[i.ProductId].LowStockThreshold));

        // Get expiry soon count
        var expirySoonCount = allInventories.Count(i => i.IsExpiringSoon(7));

        // Get recent imports
        var allImports = await _importJobRepository.GetAllAsync(cancellationToken);
        var recentImports = allImports
            .OrderByDescending(i => i.CreatedAt)
            .Take(5)
            .Select(i => new ImportJobDto
            {
                Id = i.Id,
                FileName = i.FileName,
                FileType = i.FileType,
                Status = i.Status.ToString(),
                TotalRows = i.TotalRows,
                ProcessedRows = i.ProcessedRows,
                SuccessfulRows = i.SuccessfulRows,
                FailedRows = i.FailedRows,
                CreatedAt = i.CreatedAt,
                StartedAt = i.StartedAt,
                CompletedAt = i.CompletedAt
            })
            .ToList();

        return new DashboardDto
        {
            TodaySales = todaySalesAmount,
            TotalSalesThisMonth = monthSalesAmount,
            TotalSalesCountToday = todaySalesCount,
            TotalSalesCountThisMonth = monthSalesCount,
            FastMovingProducts = fastMovingProducts,
            LowStockCount = lowStockCount,
            ExpirySoonCount = expirySoonCount,
            RecentImports = recentImports
        };
    }
}

