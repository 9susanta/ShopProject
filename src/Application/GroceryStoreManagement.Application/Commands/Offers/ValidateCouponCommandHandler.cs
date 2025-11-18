using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Offers;

public class ValidateCouponCommandHandler : IRequestHandler<ValidateCouponCommand, CouponValidationResultDto>
{
    private readonly IRepository<Offer> _offerRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly ILogger<ValidateCouponCommandHandler> _logger;

    public ValidateCouponCommandHandler(
        IRepository<Offer> offerRepository,
        IRepository<Product> productRepository,
        ILogger<ValidateCouponCommandHandler> logger)
    {
        _offerRepository = offerRepository;
        _productRepository = productRepository;
        _logger = logger;
    }

    public async Task<CouponValidationResultDto> Handle(ValidateCouponCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Validating coupon code: {CouponCode}", request.CouponCode);

        var allOffers = await _offerRepository.GetAllAsync(cancellationToken);
        var offer = allOffers.FirstOrDefault(o =>
            o.CouponCode != null &&
            o.CouponCode.Equals(request.CouponCode, StringComparison.OrdinalIgnoreCase) &&
            o.IsValid());

        if (offer == null)
        {
            return new CouponValidationResultDto
            {
                IsValid = false,
                ErrorMessage = "Invalid or expired coupon code"
            };
        }

        // If product IDs are provided, check if offer applies to any of them
        if (request.ProductIds != null && request.ProductIds.Any())
        {
            var products = (await _productRepository.FindAsync(p => request.ProductIds.Contains(p.Id), cancellationToken)).ToList();
            var productLookup = products.ToDictionary(p => p.Id);

            bool appliesToAnyProduct = false;
            foreach (var productId in request.ProductIds)
            {
                if (productLookup.ContainsKey(productId))
                {
                    var product = productLookup[productId];
                    if (offer.ProductId == product.Id || 
                        offer.CategoryId == product.CategoryId || 
                        (offer.ProductId == null && offer.CategoryId == null))
                    {
                        appliesToAnyProduct = true;
                        break;
                    }
                }
            }

            if (!appliesToAnyProduct)
            {
                return new CouponValidationResultDto
                {
                    IsValid = false,
                    ErrorMessage = "This coupon does not apply to the selected products"
                };
            }
        }

        // Calculate sample discount (for ₹100 purchase)
        var sampleDiscount = offer.CalculateDiscount(100, 1);

        return new CouponValidationResultDto
        {
            IsValid = true,
            Offer = new OfferDto
            {
                Id = offer.Id,
                Name = offer.Name,
                Description = offer.Description,
                Type = offer.Type, // Use enum directly
                DiscountValue = offer.DiscountValue,
                MinQuantity = offer.MinQuantity,
                MaxQuantity = offer.MaxQuantity,
                ProductId = offer.ProductId,
                CategoryId = offer.CategoryId,
                CouponCode = offer.CouponCode,
                StartDate = offer.StartDate,
                EndDate = offer.EndDate,
                IsActive = offer.IsActive
            },
            DiscountAmount = sampleDiscount
        };
    }
}

