using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Reports;

public class GetItemWiseSalesReportQueryHandler : IRequestHandler<GetItemWiseSalesReportQuery, ItemWiseSalesReportDto>
{
    private readonly IRepository<SaleItem> _saleItemRepository;
    private readonly ILogger<GetItemWiseSalesReportQueryHandler> _logger;

    public GetItemWiseSalesReportQueryHandler(
        IRepository<SaleItem> saleItemRepository,
        ILogger<GetItemWiseSalesReportQueryHandler> logger)
    {
        _saleItemRepository = saleItemRepository;
        _logger = logger;
    }

    public async Task<ItemWiseSalesReportDto> Handle(GetItemWiseSalesReportQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Generating item-wise sales report from {FromDate} to {ToDate}", request.FromDate, request.ToDate);

        var saleItems = await _saleItemRepository.GetAllAsync(cancellationToken);
        var filteredItems = saleItems
            .Where(si => si.Sale.SaleDate >= request.FromDate && si.Sale.SaleDate <= request.ToDate)
            .AsQueryable();

        if (request.ProductId.HasValue)
        {
            filteredItems = filteredItems.Where(si => si.ProductId == request.ProductId.Value);
        }

        if (request.CategoryId.HasValue)
        {
            filteredItems = filteredItems.Where(si => si.Product.CategoryId == request.CategoryId.Value);
        }

        var itemGroups = filteredItems
            .GroupBy(si => si.ProductId)
            .Select(g => new ItemWiseSalesItemDto
            {
                ProductId = g.Key,
                ProductName = g.First().Product.Name,
                SKU = g.First().Product.SKU,
                QuantitySold = g.Sum(si => si.Quantity),
                TotalAmount = g.Sum(si => si.TotalPrice),
                AveragePrice = g.Average(si => si.UnitPrice),
                NumberOfTransactions = g.Select(si => si.SaleId).Distinct().Count()
            })
            .OrderByDescending(i => i.TotalAmount)
            .ToList();

        return new ItemWiseSalesReportDto
        {
            FromDate = request.FromDate,
            ToDate = request.ToDate,
            Items = itemGroups,
            TotalSalesAmount = itemGroups.Sum(i => i.TotalAmount),
            TotalQuantitySold = itemGroups.Sum(i => i.QuantitySold)
        };
    }
}

