using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Queries.Reports;

public class GetFastMovingProductsQueryHandler : IRequestHandler<GetFastMovingProductsQuery, FastMovingProductsReportDto>
{
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<Product> _productRepository;

    public GetFastMovingProductsQueryHandler(
        IRepository<Sale> saleRepository,
        IRepository<Product> productRepository)
    {
        _saleRepository = saleRepository;
        _productRepository = productRepository;
    }

    public async Task<FastMovingProductsReportDto> Handle(GetFastMovingProductsQuery request, CancellationToken cancellationToken)
    {
        var startDate = request.StartDate.Date;
        var endDate = request.EndDate.Date.AddDays(1);

        var allSales = await _saleRepository.GetAllAsync(cancellationToken);
        var sales = allSales
            .Where(s => s.SaleDate >= startDate && s.SaleDate < endDate && s.Status == SaleStatus.Completed)
            .ToList();

        var productIds = sales.SelectMany(s => s.Items.Select(i => i.ProductId)).Distinct().ToList();
        var products = (await _productRepository.FindAsync(p => productIds.Contains(p.Id), cancellationToken)).ToList();
        var productLookup = products.ToDictionary(p => p.Id);

        // Aggregate product sales
        var productStats = new Dictionary<Guid, FastMovingProductDto>();

        foreach (var sale in sales)
        {
            foreach (var item in sale.Items)
            {
                if (!productStats.ContainsKey(item.ProductId))
                {
                    var product = productLookup.GetValueOrDefault(item.ProductId);
                    productStats[item.ProductId] = new FastMovingProductDto
                    {
                        ProductId = item.ProductId,
                        ProductName = product?.Name ?? "Unknown",
                        SKU = product?.SKU ?? "N/A",
                        TotalQuantitySold = 0,
                        QuantitySold = 0,
                        TotalRevenue = 0,
                        Revenue = 0,
                        NumberOfSales = 0,
                        AverageSalePrice = 0
                    };
                }

                var stat = productStats[item.ProductId];
                stat.TotalQuantitySold += item.Quantity;
                stat.QuantitySold = stat.TotalQuantitySold; // Keep both in sync
                stat.TotalRevenue += item.TotalPrice;
                stat.Revenue = stat.TotalRevenue; // Keep both in sync
                stat.NumberOfSales++;
            }
        }

        // Calculate averages and sort by quantity sold
        var fastMovingProducts = productStats.Values
            .Select(p =>
            {
                p.AverageSalePrice = p.NumberOfSales > 0 ? p.TotalRevenue / p.NumberOfSales : 0;
                return p;
            })
            .OrderByDescending(p => p.TotalQuantitySold)
            .Take(request.TopN)
            .ToList();

        return new FastMovingProductsReportDto
        {
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Products = fastMovingProducts
        };
    }
}

