using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Products;

public class GetProductsByCategoryQueryHandler : IRequestHandler<GetProductsByCategoryQuery, List<ProductDto>>
{
    private readonly IRepository<Product> _productRepository;
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetProductsByCategoryQueryHandler> _logger;

    public GetProductsByCategoryQueryHandler(
        IRepository<Product> productRepository,
        ICacheService cacheService,
        ILogger<GetProductsByCategoryQueryHandler> logger)
    {
        _productRepository = productRepository;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<List<ProductDto>> Handle(GetProductsByCategoryQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"products:category:{request.CategoryId}:active:{!request.IncludeInactive}";
        
        var cached = await _cacheService.GetAsync<List<ProductDto>>(cacheKey, cancellationToken);
        if (cached != null)
        {
            _logger.LogDebug("Cache hit for products by category: {CategoryId}", request.CategoryId);
            return cached;
        }

        _logger.LogDebug("Cache miss for products by category: {CategoryId}", request.CategoryId);

        var products = await _productRepository.FindAsync(p => 
            p.CategoryId == request.CategoryId && 
            (request.IncludeInactive || p.IsActive), cancellationToken);

        var productList = products.ToList();
        var result = productList.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            SKU = p.SKU,
            UnitPrice = p.SalePrice,
            CategoryId = p.CategoryId,
            LowStockThreshold = p.LowStockThreshold,
            IsActive = p.IsActive
        }).ToList();

        // Cache for 10 minutes
        await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(10), cancellationToken);

        return result;
    }
}

