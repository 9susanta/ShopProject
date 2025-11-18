using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Reports;

public class GetExpiryReportQueryHandler : IRequestHandler<GetExpiryReportQuery, ExpiryReportDto>
{
    private readonly IRepository<InventoryBatch> _batchRepository;
    private readonly ILogger<GetExpiryReportQueryHandler> _logger;

    public GetExpiryReportQueryHandler(
        IRepository<InventoryBatch> batchRepository,
        ILogger<GetExpiryReportQueryHandler> logger)
    {
        _batchRepository = batchRepository;
        _logger = logger;
    }

    public async Task<ExpiryReportDto> Handle(GetExpiryReportQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Generating expiry report for products expiring within {DaysThreshold} days", request.DaysThreshold);

        var cutoffDate = DateTime.UtcNow.AddDays(request.DaysThreshold);
        var batches = await _batchRepository.GetAllAsync(cancellationToken);

        var expiringBatches = batches
            .Where(b => b.ExpiryDate.HasValue && b.ExpiryDate.Value <= cutoffDate && b.Quantity > 0)
            .Select(b => new ExpiryItemDto
            {
                BatchId = b.Id,
                ProductId = b.ProductId,
                ProductName = b.Product.Name,
                BatchNumber = b.BatchNumber ?? "N/A",
                Quantity = b.Quantity,
                ExpiryDate = b.ExpiryDate!.Value,
                DaysUntilExpiry = (int)(b.ExpiryDate.Value - DateTime.UtcNow).TotalDays,
                IsExpired = b.ExpiryDate.Value < DateTime.UtcNow
            })
            .OrderBy(i => i.ExpiryDate)
            .ToList();

        return new ExpiryReportDto
        {
            GeneratedAt = DateTime.UtcNow,
            DaysThreshold = request.DaysThreshold,
            Items = expiringBatches
        };
    }
}

