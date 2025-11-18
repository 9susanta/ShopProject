using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Queries.Customers;

public class GetCustomerSavedItemsQueryHandler : IRequestHandler<GetCustomerSavedItemsQuery, CustomerSavedItemListResponseDto>
{
    private readonly IRepository<CustomerSavedItem> _savedItemRepository;
    private readonly IRepository<Product> _productRepository;

    public GetCustomerSavedItemsQueryHandler(
        IRepository<CustomerSavedItem> savedItemRepository,
        IRepository<Product> productRepository)
    {
        _savedItemRepository = savedItemRepository;
        _productRepository = productRepository;
    }

    public async Task<CustomerSavedItemListResponseDto> Handle(GetCustomerSavedItemsQuery request, CancellationToken cancellationToken)
    {
        var allSavedItems = await _savedItemRepository.GetAllAsync(cancellationToken);
        var savedItems = allSavedItems
            .Where(si => si.CustomerId == request.CustomerId)
            .AsQueryable()
            .ToList()
            .AsQueryable(); // Materialize to load navigation properties

        // Filter by favorite if specified
        if (request.IsFavorite.HasValue)
        {
            savedItems = savedItems.Where(si => si.IsFavorite == request.IsFavorite.Value);
        }

        var totalCount = savedItems.Count();

        // Order by favorite first, then by purchase count, then by last purchased
        var pagedItems = savedItems
            .OrderByDescending(si => si.IsFavorite)
            .ThenByDescending(si => si.PurchaseCount)
            .ThenByDescending(si => si.LastPurchasedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var allProducts = await _productRepository.GetAllAsync(cancellationToken);
        var productLookup = allProducts.ToDictionary(p => p.Id, p => p);

        var itemDtos = pagedItems.Select(item =>
        {
            var product = productLookup.GetValueOrDefault(item.ProductId);
            return new CustomerSavedItemDto
            {
                Id = item.Id,
                CustomerId = item.CustomerId,
                ProductId = item.ProductId,
                ProductName = product?.Name ?? "Unknown",
                ProductSKU = product?.SKU ?? "",
                ProductPrice = product?.SalePrice,
                PurchaseCount = item.PurchaseCount,
                LastPurchasedAt = item.LastPurchasedAt,
                IsFavorite = item.IsFavorite,
                CreatedAt = item.CreatedAt
            };
        }).ToList();

        return new CustomerSavedItemListResponseDto
        {
            Items = itemDtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}

