using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Products;

public class SearchProductsQueryHandler : IRequestHandler<SearchProductsQuery, List<ProductDto>>
{
    private readonly IRepository<Product> _productRepository;
    private readonly ICacheService _cacheService;
    private readonly ILogger<SearchProductsQueryHandler> _logger;

    public SearchProductsQueryHandler(
        IRepository<Product> productRepository,
        ICacheService cacheService,
        ILogger<SearchProductsQueryHandler> logger)
    {
        _productRepository = productRepository;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<List<ProductDto>> Handle(SearchProductsQuery request, CancellationToken cancellationToken)
    {
        // For barcode search, use cache
        if (!string.IsNullOrWhiteSpace(request.Barcode))
        {
            var cacheKey = $"product:barcode:{request.Barcode}";
            var cached = await _cacheService.GetAsync<ProductDto>(cacheKey, cancellationToken);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for product by barcode: {Barcode}", request.Barcode);
                return new List<ProductDto> { cached };
            }
        }

        var allProducts = await _productRepository.GetAllAsync(cancellationToken);
        var products = allProducts.AsQueryable();

        // Filter by barcode
        if (!string.IsNullOrWhiteSpace(request.Barcode))
        {
            products = products.Where(p => p.Barcode == request.Barcode);
        }

        // Filter by category
        if (request.CategoryId.HasValue)
        {
            products = products.Where(p => p.CategoryId == request.CategoryId.Value);
        }

        // Search by name or SKU
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            products = products.Where(p => 
                p.Name.ToLower().Contains(searchTerm) || 
                p.SKU.ToLower().Contains(searchTerm) ||
                (p.Description != null && p.Description.ToLower().Contains(searchTerm)));
        }

        // Only active products
        products = products.Where(p => p.IsActive);

        var result = products
            .Take(request.MaxResults)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                SKU = p.SKU,
                UnitPrice = p.SalePrice,
                CategoryId = p.CategoryId,
                LowStockThreshold = p.LowStockThreshold,
                IsActive = p.IsActive
            })
            .ToList();

        // Cache barcode lookup for 30 minutes
        if (!string.IsNullOrWhiteSpace(request.Barcode) && result.Count == 1)
        {
            var cacheKey = $"product:barcode:{request.Barcode}";
            await _cacheService.SetAsync(cacheKey, result[0], TimeSpan.FromMinutes(30), cancellationToken);
        }

        return result;
    }
}

