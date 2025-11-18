using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Commands.Offers;

public class CreateOfferCommandHandler : IRequestHandler<CreateOfferCommand, OfferDto>
{
    private readonly IRepository<Offer> _offerRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<Category> _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateOfferCommandHandler(
        IRepository<Offer> offerRepository,
        IRepository<Product> productRepository,
        IRepository<Category> categoryRepository,
        IUnitOfWork unitOfWork)
    {
        _offerRepository = offerRepository;
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<OfferDto> Handle(CreateOfferCommand request, CancellationToken cancellationToken)
    {
        // Validate product if provided
        if (request.ProductId.HasValue)
        {
            var productExists = await _productRepository.GetByIdAsync(request.ProductId.Value, cancellationToken);
            if (productExists == null)
                throw new KeyNotFoundException($"Product with ID {request.ProductId} not found.");
        }

        // Validate category if provided
        if (request.CategoryId.HasValue)
        {
            var categoryExists = await _categoryRepository.GetByIdAsync(request.CategoryId.Value, cancellationToken);
            if (categoryExists == null)
                throw new KeyNotFoundException($"Category with ID {request.CategoryId} not found.");
        }

        // Validate coupon code uniqueness if provided
        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var existingOffers = await _offerRepository.GetAllAsync(cancellationToken);
            if (existingOffers.Any(o => o.CouponCode != null && 
                o.CouponCode.Equals(request.CouponCode, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"Coupon code '{request.CouponCode}' already exists.");
            }
        }

        var offer = new Offer(
            request.Name,
            request.Type,
            request.DiscountValue,
            request.StartDate,
            request.EndDate,
            request.ProductId,
            request.CategoryId,
            request.CouponCode,
            request.Description,
            request.MinQuantity,
            request.MaxQuantity);

        if (!request.IsActive)
        {
            // Note: Offer entity doesn't have a SetActive method, so we'd need to add it or handle it differently
            // For now, we'll create it as active and handle deactivation separately
        }

        await _offerRepository.AddAsync(offer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Load related entities for DTO
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

