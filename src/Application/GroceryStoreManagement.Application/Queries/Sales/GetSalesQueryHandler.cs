using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Queries.Sales;

public class GetSalesQueryHandler : IRequestHandler<GetSalesQuery, SaleListResponseDto>
{
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<Offer> _offerRepository;

    public GetSalesQueryHandler(IRepository<Sale> saleRepository, IRepository<Offer> offerRepository)
    {
        _saleRepository = saleRepository;
        _offerRepository = offerRepository;
    }

    public async Task<SaleListResponseDto> Handle(GetSalesQuery request, CancellationToken cancellationToken)
    {
        var allSales = await _saleRepository.GetAllAsync(cancellationToken);
        var sales = allSales.AsQueryable();

        // Filter by search term
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.ToLower();
            sales = sales.Where(s =>
                s.InvoiceNumber.ToLower().Contains(searchTerm) ||
                (s.Customer != null && s.Customer.Name.ToLower().Contains(searchTerm)) ||
                (s.Customer != null && s.Customer.Phone.Contains(searchTerm)));
        }

        // Filter by customer
        if (request.CustomerId.HasValue)
        {
            sales = sales.Where(s => s.CustomerId == request.CustomerId.Value);
        }

        // Filter by status
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            sales = sales.Where(s => s.Status.ToString() == request.Status);
        }

        // Filter by date range
        if (request.FromDate.HasValue)
        {
            sales = sales.Where(s => s.SaleDate >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            sales = sales.Where(s => s.SaleDate <= request.ToDate.Value);
        }

        // Get total count before pagination
        var totalCount = sales.Count();
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        // Apply pagination
        var pagedSales = sales
            .OrderByDescending(s => s.SaleDate)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        // Load offers for all sale items
        var offerIds = pagedSales
            .SelectMany(s => s.Items.Where(i => i.OfferId.HasValue).Select(i => i.OfferId!.Value))
            .Distinct()
            .ToList();

        var offers = offerIds.Any()
            ? (await _offerRepository.FindAsync(o => offerIds.Contains(o.Id), cancellationToken)).ToList()
            : new List<Offer>();

        var offerLookup = offers.ToDictionary(o => o.Id);

        var saleDtos = pagedSales.Select(s => new SaleDto
        {
            Id = s.Id,
            InvoiceNumber = s.InvoiceNumber,
            CustomerId = s.CustomerId,
            CustomerName = s.Customer?.Name,
            CustomerPhone = s.Customer?.Phone,
            Status = s.Status.ToString(),
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
            Notes = null, // Sale entity doesn't have Notes property
            Items = s.Items.Select(i =>
            {
                var offer = i.OfferId.HasValue ? offerLookup.GetValueOrDefault(i.OfferId.Value) : null;
                return new SaleItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product?.Name ?? "Unknown",
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.TotalPrice,
                    DiscountAmount = i.DiscountAmount > 0 ? i.DiscountAmount : null,
                    OfferId = i.OfferId,
                    OfferName = offer?.Name
                };
            }).ToList()
        }).ToList();

        return new SaleListResponseDto
        {
            Items = saleDtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalPages = totalPages
        };
    }
}

