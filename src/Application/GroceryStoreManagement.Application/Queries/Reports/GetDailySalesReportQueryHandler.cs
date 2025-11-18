using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Queries.Reports;

public class GetDailySalesReportQueryHandler : IRequestHandler<GetDailySalesReportQuery, DailySalesReportDto>
{
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<Offer> _offerRepository;

    public GetDailySalesReportQueryHandler(
        IRepository<Sale> saleRepository,
        IRepository<Product> productRepository,
        IRepository<Offer> offerRepository)
    {
        _saleRepository = saleRepository;
        _productRepository = productRepository;
        _offerRepository = offerRepository;
    }

    public async Task<DailySalesReportDto> Handle(GetDailySalesReportQuery request, CancellationToken cancellationToken)
    {
        var startDate = request.Date.Date;
        var endDate = startDate.AddDays(1);

        var allSales = await _saleRepository.GetAllAsync(cancellationToken);
        var sales = allSales
            .Where(s => s.SaleDate >= startDate && s.SaleDate < endDate && s.Status == SaleStatus.Completed)
            .ToList();

        var productIds = sales.SelectMany(s => s.Items.Select(i => i.ProductId)).Distinct().ToList();
        var products = (await _productRepository.FindAsync(p => productIds.Contains(p.Id), cancellationToken)).ToList();
        var productLookup = products.ToDictionary(p => p.Id);

        var offerIds = sales.SelectMany(s => s.Items.Where(i => i.OfferId.HasValue).Select(i => i.OfferId!.Value)).Distinct().ToList();
        var offers = offerIds.Any()
            ? (await _offerRepository.FindAsync(o => offerIds.Contains(o.Id), cancellationToken)).ToList()
            : new List<Offer>();
        var offerLookup = offers.ToDictionary(o => o.Id);

        var saleDtos = sales.Select(s => new SaleDto
        {
            Id = s.Id,
            InvoiceNumber = s.InvoiceNumber,
            CustomerId = s.CustomerId,
            CustomerName = s.Customer?.Name,
            CustomerPhone = s.CustomerPhone,
            SaleDate = s.SaleDate,
            SubTotal = s.SubTotal,
            TaxAmount = s.TotalGSTAmount,
            DiscountAmount = s.DiscountAmount,
            TotalAmount = s.TotalAmount,
            PaymentMethod = s.PaymentMethod,
            CashAmount = s.CashAmount,
            UPIAmount = s.UPIAmount,
            CardAmount = s.CardAmount,
            PayLaterAmount = s.PayLaterAmount,
            Items = s.Items.Select(i =>
            {
                var product = productLookup.GetValueOrDefault(i.ProductId);
                var offer = i.OfferId.HasValue ? offerLookup.GetValueOrDefault(i.OfferId.Value) : null;
                return new SaleItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = product?.Name ?? "Unknown",
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.TotalPrice,
                    DiscountAmount = i.DiscountAmount > 0 ? i.DiscountAmount : null,
                    OfferId = i.OfferId,
                    OfferName = offer?.Name
                };
            }).ToList()
        }).ToList();

        return new DailySalesReportDto
        {
            Date = request.Date,
            TotalSales = sales.Count,
            TotalRevenue = sales.Sum(s => s.TotalAmount),
            TotalTax = sales.Sum(s => s.TotalGSTAmount),
            TotalDiscount = sales.Sum(s => s.DiscountAmount),
            TotalCash = sales.Sum(s => s.CashAmount),
            TotalUPI = sales.Sum(s => s.UPIAmount),
            TotalCard = sales.Sum(s => s.CardAmount),
            TotalPayLater = sales.Sum(s => s.PayLaterAmount),
            TotalCustomers = sales.Where(s => s.CustomerId.HasValue).Select(s => s.CustomerId!.Value).Distinct().Count(),
            Sales = saleDtos
        };
    }
}

