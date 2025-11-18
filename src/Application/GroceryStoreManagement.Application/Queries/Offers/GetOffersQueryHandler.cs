using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Queries.Offers;

public class GetOffersQueryHandler : IRequestHandler<GetOffersQuery, List<OfferDto>>
{
    private readonly IRepository<Offer> _offerRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<Category> _categoryRepository;

    public GetOffersQueryHandler(
        IRepository<Offer> offerRepository,
        IRepository<Product> productRepository,
        IRepository<Category> categoryRepository)
    {
        _offerRepository = offerRepository;
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<List<OfferDto>> Handle(GetOffersQuery request, CancellationToken cancellationToken)
    {
        var allOffers = await _offerRepository.GetAllAsync(cancellationToken);
        var offers = allOffers.AsQueryable();

        // Filter by active status
        if (request.IsActive.HasValue)
        {
            offers = offers.Where(o => o.IsActive == request.IsActive.Value);
        }

        // Filter by validity
        if (request.IsValid.HasValue && request.IsValid.Value)
        {
            var now = DateTime.UtcNow;
            offers = offers.Where(o => o.IsActive && o.StartDate <= now && o.EndDate >= now);
        }

        // Filter by product
        if (request.ProductId.HasValue)
        {
            offers = offers.Where(o => o.ProductId == request.ProductId.Value);
        }

        // Filter by category
        if (request.CategoryId.HasValue)
        {
            offers = offers.Where(o => o.CategoryId == request.CategoryId.Value);
        }

        var offerList = offers.ToList();

        // Load related entities
        var productIds = offerList.Where(o => o.ProductId.HasValue).Select(o => o.ProductId!.Value).Distinct().ToList();
        var categoryIds = offerList.Where(o => o.CategoryId.HasValue).Select(o => o.CategoryId!.Value).Distinct().ToList();

        var products = productIds.Any() 
            ? (await _productRepository.FindAsync(p => productIds.Contains(p.Id), cancellationToken)).ToList()
            : new List<Product>();
        var categories = categoryIds.Any()
            ? (await _categoryRepository.FindAsync(c => categoryIds.Contains(c.Id), cancellationToken)).ToList()
            : new List<Category>();

        var productLookup = products.ToDictionary(p => p.Id);
        var categoryLookup = categories.ToDictionary(c => c.Id);

        return offerList.Select(o => new OfferDto
        {
            Id = o.Id,
            Name = o.Name,
            Description = o.Description,
            Type = o.Type,
            DiscountValue = o.DiscountValue,
            MinQuantity = o.MinQuantity,
            MaxQuantity = o.MaxQuantity,
            ProductId = o.ProductId,
            ProductName = o.ProductId.HasValue ? productLookup.GetValueOrDefault(o.ProductId.Value)?.Name : null,
            CategoryId = o.CategoryId,
            CategoryName = o.CategoryId.HasValue ? categoryLookup.GetValueOrDefault(o.CategoryId.Value)?.Name : null,
            CouponCode = o.CouponCode,
            StartDate = o.StartDate,
            EndDate = o.EndDate,
            IsActive = o.IsActive,
            CreatedAt = o.CreatedAt,
            UpdatedAt = o.UpdatedAt
        }).ToList();
    }
}

