using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetExpirySoonQueryHandler : IRequestHandler<GetExpirySoonQuery, List<InventoryDto>>
{
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly ILogger<GetExpirySoonQueryHandler> _logger;

    public GetExpirySoonQueryHandler(
        IRepository<InventoryEntity> inventoryRepository,
        IRepository<Product> productRepository,
        ILogger<GetExpirySoonQueryHandler> logger)
    {
        _inventoryRepository = inventoryRepository;
        _productRepository = productRepository;
        _logger = logger;
    }

    public async Task<List<InventoryDto>> Handle(GetExpirySoonQuery request, CancellationToken cancellationToken)
    {
        var allInventories = await _inventoryRepository.GetAllAsync(cancellationToken);
        var allProducts = await _productRepository.GetAllAsync(cancellationToken);
        var productDict = allProducts.ToDictionary(p => p.Id);

        var expirySoonInventories = allInventories
            .Where(i => i.IsExpiringSoon(request.DaysThreshold))
            .Select(i =>
            {
                var product = productDict.ContainsKey(i.ProductId) ? productDict[i.ProductId] : null;
                return new InventoryDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = product?.Name ?? "Unknown",
                    SKU = product?.SKU ?? "",
                    QuantityOnHand = i.QuantityOnHand,
                    ReservedQuantity = i.ReservedQuantity,
                    AvailableQuantity = i.AvailableQuantity,
                    IsLowStock = product != null && i.IsLowStock(product.LowStockThreshold)
                };
            })
            .OrderBy(i => i.ProductId)
            .ToList();

        return expirySoonInventories;
    }
}

