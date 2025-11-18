using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Queries.Reports;

public class GetGSTSummaryReportQueryHandler : IRequestHandler<GetGSTSummaryReportQuery, GSTSummaryReportDto>
{
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<Product> _productRepository;

    public GetGSTSummaryReportQueryHandler(
        IRepository<Sale> saleRepository,
        IRepository<Product> productRepository)
    {
        _saleRepository = saleRepository;
        _productRepository = productRepository;
    }

    public async Task<GSTSummaryReportDto> Handle(GetGSTSummaryReportQuery request, CancellationToken cancellationToken)
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

        // Group by GST rate
        var slabGroups = new Dictionary<decimal, GSTSlabSummaryDto>();

        foreach (var sale in sales)
        {
            foreach (var item in sale.Items)
            {
                var product = productLookup.GetValueOrDefault(item.ProductId);
                var gstRate = product?.TaxSlab?.Rate ?? 0m;
                
                if (gstRate > 0)
                {
                    if (!slabGroups.ContainsKey(gstRate))
                    {
                        slabGroups[gstRate] = new GSTSlabSummaryDto
                        {
                            Rate = gstRate,
                            TaxableAmount = 0,
                            CGSTAmount = 0,
                            SGSTAmount = 0,
                            TotalGSTAmount = 0,
                            TransactionCount = 0
                        };
                    }

                    var slab = slabGroups[gstRate];
                    var itemTotal = item.TotalPrice - item.DiscountAmount;
                    var cgstRate = gstRate / 2;
                    var sgstRate = gstRate / 2;
                    
                    // Calculate taxable amount (before GST)
                    var taxableAmount = itemTotal / (1 + (gstRate / 100));
                    var cgstAmount = taxableAmount * (cgstRate / 100);
                    var sgstAmount = taxableAmount * (sgstRate / 100);
                    var totalGST = cgstAmount + sgstAmount;

                    slab.TaxableAmount += taxableAmount;
                    slab.CGSTAmount += cgstAmount;
                    slab.SGSTAmount += sgstAmount;
                    slab.TotalGSTAmount += totalGST;
                    slab.TransactionCount++;
                }
            }
        }

        return new GSTSummaryReportDto
        {
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TotalSales = sales.Sum(s => s.TotalAmount),
            TotalGST = sales.Sum(s => s.TotalGSTAmount),
            TotalCGST = sales.Sum(s => s.CGSTAmount),
            TotalSGST = sales.Sum(s => s.SGSTAmount),
            SlabSummaries = slabGroups.Values.OrderByDescending(s => s.Rate).ToList()
        };
    }
}

