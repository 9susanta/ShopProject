using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetInventoryProductsQueryHandler : IRequestHandler<GetInventoryProductsQuery, ProductInventoryListResponseDto>
{
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly IRepository<InventoryBatch> _batchRepository;
    private readonly IRepository<Category> _categoryRepository;
    private readonly ILogger<GetInventoryProductsQueryHandler> _logger;

    public GetInventoryProductsQueryHandler(
        IRepository<Product> productRepository,
        IRepository<InventoryEntity> inventoryRepository,
        IRepository<InventoryBatch> batchRepository,
        IRepository<Category> categoryRepository,
        ILogger<GetInventoryProductsQueryHandler> logger)
    {
        _productRepository = productRepository;
        _inventoryRepository = inventoryRepository;
        _batchRepository = batchRepository;
        _categoryRepository = categoryRepository;
        _logger = logger;
    }

    public async Task<ProductInventoryListResponseDto> Handle(GetInventoryProductsQuery request, CancellationToken cancellationToken)
    {
        var allProducts = await _productRepository.GetAllAsync(cancellationToken);
        var allInventories = await _inventoryRepository.GetAllAsync(cancellationToken);
        var allBatches = await _batchRepository.GetAllAsync(cancellationToken);
        var allCategories = await _categoryRepository.GetAllAsync(cancellationToken);

        var products = allProducts.AsQueryable().Where(p => p.IsActive);

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

        // Create lookups
        var inventoryLookup = allInventories.ToDictionary(i => i.ProductId, i => i);
        var batchLookup = allBatches
            .Where(b => b.IsActive)
            .GroupBy(b => b.ProductId)
            .ToDictionary(g => g.Key, g => g.ToList());
        var categoryLookup = allCategories.ToDictionary(c => c.Id, c => c.Name);

        // Filter by low stock if requested
        if (request.LowStock == true)
        {
            var productList = products.ToList();
            products = productList
                .Where(p => inventoryLookup.ContainsKey(p.Id) && 
                           inventoryLookup[p.Id].AvailableQuantity <= p.LowStockThreshold)
                .AsQueryable();
        }

        // Get total count before pagination
        var totalCount = products.Count();

        // Apply pagination
        var pagedProducts = products
            .OrderBy(p => p.Name)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        // Map to ProductInventoryDto
        var productInventoryDtos = pagedProducts.Select(p =>
        {
            var inventory = inventoryLookup.ContainsKey(p.Id) ? inventoryLookup[p.Id] : null;
            var batches = batchLookup.ContainsKey(p.Id) ? batchLookup[p.Id] : new List<InventoryBatch>();
            
            var totalQuantity = inventory?.QuantityOnHand ?? 0;
            var availableQuantity = inventory?.AvailableQuantity ?? 0;
            var reservedQuantity = inventory?.ReservedQuantity ?? 0;
            var isLowStock = inventory != null && availableQuantity <= p.LowStockThreshold;

            var batchDtos = batches.Select(b => new InventoryBatchDto
            {
                Id = b.Id,
                ProductId = b.ProductId,
                ProductName = p.Name,
                ProductSKU = p.SKU,
                BatchNumber = b.BatchNumber ?? string.Empty,
                Quantity = b.Quantity,
                AvailableQuantity = b.AvailableQuantity,
                ReservedQuantity = 0, // Batches don't track reserved separately
                UnitCost = b.UnitCost,
                ExpiryDate = b.ExpiryDate,
                ReceivedDate = b.ReceivedDate,
                IsExpiringSoon = b.IsExpiringSoon(7),
                DaysUntilExpiry = b.ExpiryDate.HasValue 
                    ? (int?)(b.ExpiryDate.Value - DateTime.UtcNow).TotalDays 
                    : null,
                Location = null, // Location not tracked in batch entity
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt,
            }).ToList();

            return new ProductInventoryDto
            {
                Id = p.Id,
                ProductId = p.Id,
                ProductName = p.Name,
                ProductSKU = p.SKU,
                CategoryId = p.CategoryId,
                CategoryName = categoryLookup.TryGetValue(p.CategoryId, out var catName) ? catName : null,
                TotalQuantity = totalQuantity,
                AvailableQuantity = availableQuantity,
                ReservedQuantity = reservedQuantity,
                LowStockThreshold = p.LowStockThreshold > 0 ? (int?)p.LowStockThreshold : null,
                IsLowStock = isLowStock,
                Batches = batchDtos,
                LastUpdatedAt = inventory?.UpdatedAt ?? p.UpdatedAt ?? p.CreatedAt,
            };
        }).ToList();

        // Filter by expiry soon if requested
        if (request.ExpirySoon == true)
        {
            productInventoryDtos = productInventoryDtos
                .Where(p => p.Batches.Any(b => b.IsExpiringSoon))
                .ToList();
            totalCount = productInventoryDtos.Count; // Recalculate after filtering
        }

        return new ProductInventoryListResponseDto
        {
            Items = productInventoryDtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
        };
    }
}

