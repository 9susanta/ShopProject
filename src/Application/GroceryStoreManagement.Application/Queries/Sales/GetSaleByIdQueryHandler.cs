using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Queries.Sales;

public class GetSaleByIdQueryHandler : IRequestHandler<GetSaleByIdQuery, SaleDto?>
{
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<Offer> _offerRepository;

    public GetSaleByIdQueryHandler(
        IRepository<Sale> saleRepository,
        IRepository<Offer> offerRepository)
    {
        _saleRepository = saleRepository;
        _offerRepository = offerRepository;
    }

    public async Task<SaleDto?> Handle(GetSaleByIdQuery request, CancellationToken cancellationToken)
    {
        var sale = await _saleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (sale == null)
            return null;

        // Load offers for sale items
        var offerIds = sale.Items.Where(i => i.OfferId.HasValue).Select(i => i.OfferId!.Value).Distinct().ToList();
        var offers = offerIds.Any()
            ? (await _offerRepository.FindAsync(o => offerIds.Contains(o.Id), cancellationToken)).ToList()
            : new List<Offer>();
        var offerLookup = offers.ToDictionary(o => o.Id);

        return new SaleDto
        {
            Id = sale.Id,
            InvoiceNumber = sale.InvoiceNumber,
            CustomerId = sale.CustomerId,
            CustomerName = sale.Customer?.Name,
            CustomerPhone = sale.CustomerPhone,
            Status = sale.Status.ToString(),
            SaleDate = sale.SaleDate,
            SubTotal = sale.SubTotal,
            TaxAmount = sale.TotalGSTAmount,
            DiscountAmount = sale.DiscountAmount,
            TotalAmount = sale.TotalAmount,
            PaymentMethod = sale.PaymentMethod,
            CashAmount = sale.CashAmount,
            UPIAmount = sale.UPIAmount,
            CardAmount = sale.CardAmount,
            PayLaterAmount = sale.PayLaterAmount,
            Notes = null,
            Items = sale.Items.Select(i =>
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
        };
    }
}

