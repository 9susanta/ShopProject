using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Queries.Products;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, ProductListResponseDto>
{
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly ILogger<GetProductsQueryHandler> _logger;

    public GetProductsQueryHandler(
        IRepository<Product> productRepository,
        IRepository<InventoryEntity> inventoryRepository,
        ILogger<GetProductsQueryHandler> logger)
    {
        _productRepository = productRepository;
        _inventoryRepository = inventoryRepository;
        _logger = logger;
    }

    public async Task<ProductListResponseDto> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var allProducts = await _productRepository.GetAllAsync(cancellationToken);
        var products = allProducts.AsQueryable();

        // Filter by search term
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.ToLower();
            products = products.Where(p =>
                p.Name.ToLower().Contains(searchTerm) ||
                p.SKU.ToLower().Contains(searchTerm) ||
                (p.Description != null && p.Description.ToLower().Contains(searchTerm)) ||
                (p.Barcode != null && p.Barcode.ToLower().Contains(searchTerm)));
        }

        // Filter by category
        if (request.CategoryId.HasValue)
        {
            products = products.Where(p => p.CategoryId == request.CategoryId.Value);
        }

        // Filter by active status
        if (request.IsActive.HasValue)
        {
            products = products.Where(p => p.IsActive == request.IsActive.Value);
        }
        else
        {
            // Default to active products only
            products = products.Where(p => p.IsActive);
        }

        // Get inventory data for low stock filtering (needed before pagination if filtering by low stock)
        var allInventory = await _inventoryRepository.GetAllAsync(cancellationToken);
        var inventoryLookup = allInventory.ToDictionary(i => i.ProductId, i => i.AvailableQuantity);

        // Filter by low stock if requested (must be done before pagination for accurate count)
        if (request.LowStock == true)
        {
            // Materialize the query first to avoid expression tree issues with TryGetValue
            var productList = products.ToList();
            products = productList
                .Where(p => inventoryLookup.ContainsKey(p.Id) && inventoryLookup[p.Id] <= p.LowStockThreshold)
                .AsQueryable();
        }

        // Apply sorting
        if (!string.IsNullOrWhiteSpace(request.SortBy))
        {
            var sortOrder = request.SortOrder?.ToLower() == "desc" ? false : true;
            products = request.SortBy.ToLower() switch
            {
                "name" => sortOrder ? products.OrderBy(p => p.Name) : products.OrderByDescending(p => p.Name),
                "sku" => sortOrder ? products.OrderBy(p => p.SKU) : products.OrderByDescending(p => p.SKU),
                "saleprice" => sortOrder ? products.OrderBy(p => p.SalePrice) : products.OrderByDescending(p => p.SalePrice),
                "mrp" => sortOrder ? products.OrderBy(p => p.MRP) : products.OrderByDescending(p => p.MRP),
                "isactive" => sortOrder ? products.OrderBy(p => p.IsActive) : products.OrderByDescending(p => p.IsActive),
                "createdat" => sortOrder ? products.OrderBy(p => p.CreatedAt) : products.OrderByDescending(p => p.CreatedAt),
                _ => products.OrderBy(p => p.Name) // Default sort by name
            };
        }
        else
        {
            // Default sort by name
            products = products.OrderBy(p => p.Name);
        }

        // Get total count before pagination
        var totalCount = products.Count();

        // Apply pagination
        var pagedProducts = products
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();
        
        List<Product> filteredProducts = pagedProducts;

        // Map to DTOs
        var productDtos = filteredProducts.Select(p =>
        {
            var dto = new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                SKU = p.SKU,
                Barcode = p.Barcode,
                UnitPrice = p.SalePrice,
                SalePrice = p.SalePrice,
                MRP = p.MRP,
                CategoryId = p.CategoryId,
                LowStockThreshold = p.LowStockThreshold,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
            };

            // Add category name if available (would need to load categories separately)
            // For now, CategoryName will remain empty

            return dto;
        }).ToList();

        return new ProductListResponseDto
        {
            Items = productDtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}

