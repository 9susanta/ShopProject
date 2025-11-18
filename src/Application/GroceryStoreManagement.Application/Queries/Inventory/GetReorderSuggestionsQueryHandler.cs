using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetReorderSuggestionsQueryHandler : IRequestHandler<GetReorderSuggestionsQuery, List<ReorderSuggestionDto>>
{
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<InventoryEntity> _inventoryRepository; // Use alias
    private readonly ILogger<GetReorderSuggestionsQueryHandler> _logger;

    public GetReorderSuggestionsQueryHandler(
        IRepository<Product> productRepository,
        IRepository<InventoryEntity> inventoryRepository, // Use alias
        ILogger<GetReorderSuggestionsQueryHandler> logger)
    {
        _productRepository = productRepository;
        _inventoryRepository = inventoryRepository;
        _logger = logger;
    }

    public async Task<List<ReorderSuggestionDto>> Handle(GetReorderSuggestionsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving reorder suggestions");

        var products = await _productRepository.GetAllAsync(cancellationToken);
        var inventories = await _inventoryRepository.GetAllAsync(cancellationToken);
        var inventoryLookup = inventories.ToDictionary(i => i.ProductId);

        var suggestions = new List<ReorderSuggestionDto>();

        foreach (var product in products)
        {
            if (product.ReorderPoint <= 0)
                continue; // Skip products without reorder point set

            var inventory = inventoryLookup.GetValueOrDefault(product.Id);
            var currentStock = inventory?.QuantityOnHand ?? 0;

            if (request.OnlyBelowReorderPoint && currentStock >= product.ReorderPoint)
                continue; // Stock is above reorder point

            var suggestedQuantity = product.SuggestedReorderQuantity > 0
                ? product.SuggestedReorderQuantity
                : product.ReorderPoint * 2; // Default: 2x reorder point

            // Get unit cost from inventory batches or use 0
            // TODO: Calculate average cost from batches if needed
            var unitCost = 0m;

            suggestions.Add(new ReorderSuggestionDto
            {
                ProductId = product.Id,
                ProductName = product.Name,
                SKU = product.SKU,
                CurrentStock = currentStock,
                ReorderPoint = product.ReorderPoint,
                SuggestedQuantity = suggestedQuantity,
                UnitCost = unitCost,
                EstimatedCost = unitCost * suggestedQuantity
            });
        }

        return suggestions.OrderBy(s => s.CurrentStock).ToList();
    }
}

