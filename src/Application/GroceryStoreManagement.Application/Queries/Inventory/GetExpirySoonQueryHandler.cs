using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetExpirySoonQueryHandler : IRequestHandler<GetExpirySoonQuery, List<ExpirySoonBatchDto>>
{
    private readonly IRepository<InventoryBatch> _batchRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly ILogger<GetExpirySoonQueryHandler> _logger;

    public GetExpirySoonQueryHandler(
        IRepository<InventoryBatch> batchRepository,
        IRepository<Product> productRepository,
        ILogger<GetExpirySoonQueryHandler> logger)
    {
        _batchRepository = batchRepository;
        _productRepository = productRepository;
        _logger = logger;
    }

    public async Task<List<ExpirySoonBatchDto>> Handle(GetExpirySoonQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching batches expiring within {Days} days", request.DaysThreshold);

        var allBatches = await _batchRepository.GetAllAsync(cancellationToken);
        var allProducts = await _productRepository.GetAllAsync(cancellationToken);

        var expirySoonBatches = new List<ExpirySoonBatchDto>();

        foreach (var batch in allBatches.Where(b => b.IsActive && b.ExpiryDate.HasValue && b.IsExpiringSoon(request.DaysThreshold)))
        {
            var product = allProducts.FirstOrDefault(p => p.Id == batch.ProductId);
            if (product == null || !product.IsActive)
                continue;

            var daysUntilExpiry = (batch.ExpiryDate!.Value - DateTime.UtcNow).Days;

            expirySoonBatches.Add(new ExpirySoonBatchDto
            {
                BatchId = batch.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                SKU = product.SKU,
                AvailableQuantity = batch.AvailableQuantity,
                ExpiryDate = batch.ExpiryDate.Value,
                DaysUntilExpiry = daysUntilExpiry,
                BatchNumber = batch.BatchNumber
            });
        }

        return expirySoonBatches.OrderBy(b => b.ExpiryDate).ToList();
    }
}
