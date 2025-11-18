using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Commands.Offers;

public class UpdateOfferCommandHandler : IRequestHandler<UpdateOfferCommand, OfferDto>
{
    private readonly IRepository<Offer> _offerRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<Category> _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateOfferCommandHandler(
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

    public async Task<OfferDto> Handle(UpdateOfferCommand request, CancellationToken cancellationToken)
    {
        var offer = await _offerRepository.GetByIdAsync(request.Id, cancellationToken);
        if (offer == null)
            throw new KeyNotFoundException($"Offer with ID {request.Id} not found.");

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

        // Validate coupon code uniqueness if provided and changed
        if (!string.IsNullOrWhiteSpace(request.CouponCode) && offer.CouponCode != request.CouponCode)
        {
            var allOffers = await _offerRepository.GetAllAsync(cancellationToken);
            if (allOffers.Any(o => o.Id != request.Id && o.CouponCode != null && 
                o.CouponCode.Equals(request.CouponCode, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"Coupon code '{request.CouponCode}' already exists.");
            }
        }

        // Update offer
        offer.Update(
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

        // Update active status
        if (request.IsActive && !offer.IsActive)
        {
            offer.Activate();
        }
        else if (!request.IsActive && offer.IsActive)
        {
            offer.Deactivate();
        }

        await _offerRepository.UpdateAsync(offer, cancellationToken);
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

