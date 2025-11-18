using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Queries.Offers;

public class GetOfferByIdQueryHandler : IRequestHandler<GetOfferByIdQuery, OfferDto?>
{
    private readonly IRepository<Offer> _offerRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<Category> _categoryRepository;

    public GetOfferByIdQueryHandler(
        IRepository<Offer> offerRepository,
        IRepository<Product> productRepository,
        IRepository<Category> categoryRepository)
    {
        _offerRepository = offerRepository;
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<OfferDto?> Handle(GetOfferByIdQuery request, CancellationToken cancellationToken)
    {
        var offer = await _offerRepository.GetByIdAsync(request.Id, cancellationToken);
        if (offer == null)
            return null;

        Product? product = null;
        Category? category = null;

        if (offer.ProductId.HasValue)
        {
            product = await _productRepository.GetByIdAsync(offer.ProductId.Value, cancellationToken);
        }

        if (offer.CategoryId.HasValue)
        {
            category = await _categoryRepository.GetByIdAsync(offer.CategoryId.Value, cancellationToken);
        }

        return new OfferDto
        {
            Id = offer.Id,
            Name = offer.Name,
            Description = offer.Description,
            Type = offer.Type,
            DiscountValue = offer.DiscountValue,
            MinQuantity = offer.MinQuantity,
            MaxQuantity = offer.MaxQuantity,
            ProductId = offer.ProductId,
            ProductName = product?.Name,
            CategoryId = offer.CategoryId,
            CategoryName = category?.Name,
            CouponCode = offer.CouponCode,
            StartDate = offer.StartDate,
            EndDate = offer.EndDate,
            IsActive = offer.IsActive,
            CreatedAt = offer.CreatedAt,
            UpdatedAt = offer.UpdatedAt
        };
    }
}

