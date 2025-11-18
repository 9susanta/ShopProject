using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Offers;

public class GetApplicableOffersQueryHandler : IRequestHandler<GetApplicableOffersQuery, List<OfferDto>>
{
    private readonly IRepository<Offer> _offerRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly ILogger<GetApplicableOffersQueryHandler> _logger;

    public GetApplicableOffersQueryHandler(
        IRepository<Offer> offerRepository,
        IRepository<Product> productRepository,
        ILogger<GetApplicableOffersQueryHandler> logger)
    {
        _offerRepository = offerRepository;
        _productRepository = productRepository;
        _logger = logger;
    }

    public async Task<List<OfferDto>> Handle(GetApplicableOffersQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting applicable offers for {ProductCount} products", request.ProductIds.Count);

        if (!request.ProductIds.Any())
        {
            return new List<OfferDto>();
        }

        var allOffers = await _offerRepository.GetAllAsync(cancellationToken);
        var products = (await _productRepository.FindAsync(p => request.ProductIds.Contains(p.Id), cancellationToken)).ToList();
        var productLookup = products.ToDictionary(p => p.Id);

        var applicableOffers = new List<Offer>();

        foreach (var productId in request.ProductIds)
        {
            if (!productLookup.ContainsKey(productId))
                continue;

            var product = productLookup[productId];
            var productOffers = allOffers.Where(o =>
                o.IsValid() &&
                (
                    o.ProductId == product.Id ||
                    o.CategoryId == product.CategoryId ||
                    (o.ProductId == null && o.CategoryId == null) // Store-wide offers
                ) &&
                (
                    (request.IncludeAutoApply && string.IsNullOrWhiteSpace(o.CouponCode)) ||
                    (request.IncludeCouponOnly && !string.IsNullOrWhiteSpace(o.CouponCode))
                )
            );

            foreach (var offer in productOffers)
            {
                if (!applicableOffers.Any(o => o.Id == offer.Id))
                {
                    applicableOffers.Add(offer);
                }
            }
        }

        return applicableOffers.Select(o => new OfferDto
        {
            Id = o.Id,
            Name = o.Name,
            Description = o.Description,
            Type = o.Type, // Keep as enum, DTO will handle conversion
            DiscountValue = o.DiscountValue,
            MinQuantity = o.MinQuantity,
            MaxQuantity = o.MaxQuantity,
            ProductId = o.ProductId,
            CategoryId = o.CategoryId,
            CouponCode = o.CouponCode,
            StartDate = o.StartDate,
            EndDate = o.EndDate,
            IsActive = o.IsActive
        }).ToList();
    }
}

