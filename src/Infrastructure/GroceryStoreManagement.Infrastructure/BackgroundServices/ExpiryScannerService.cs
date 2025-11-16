using MediatR;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Events;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.BackgroundServices;

/// <summary>
/// Background service that scans inventory batches daily for expiring items
/// </summary>
public class ExpiryScannerService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ExpiryScannerService> _logger;
    private readonly TimeSpan _scanInterval = TimeSpan.FromHours(24); // Run daily
    private readonly int _daysThreshold = 7; // Default 7 days

    public ExpiryScannerService(
        IServiceProvider serviceProvider,
        ILogger<ExpiryScannerService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ExpiryScannerService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ScanForExpiringBatchesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ExpiryScannerService");
            }

            await Task.Delay(_scanInterval, stoppingToken);
        }

        _logger.LogInformation("ExpiryScannerService stopped");
    }

    private async Task ScanForExpiringBatchesAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Scanning for expiring batches...");

        using var scope = _serviceProvider.CreateScope();
        var batchRepository = scope.ServiceProvider.GetRequiredService<IRepository<InventoryBatch>>();
        var productRepository = scope.ServiceProvider.GetRequiredService<IRepository<Product>>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var allBatches = await batchRepository.GetAllAsync(cancellationToken);
        var allProducts = await productRepository.GetAllAsync(cancellationToken);
        var productsLookup = allProducts.ToDictionary(p => p.Id);

        var expiringBatches = allBatches
            .Where(b => b.IsActive && b.ExpiryDate.HasValue && b.IsExpiringSoon(_daysThreshold))
            .ToList();

        _logger.LogInformation("Found {Count} batches expiring within {Days} days", expiringBatches.Count, _daysThreshold);

        foreach (var batch in expiringBatches)
        {
            if (!productsLookup.TryGetValue(batch.ProductId, out var product))
                continue;

            var daysUntilExpiry = (batch.ExpiryDate!.Value - DateTime.UtcNow).Days;

            var expiryEvent = new ExpirySoonEvent(
                batch.ProductId,
                product.Name,
                product.SKU,
                batch.ExpiryDate.Value,
                daysUntilExpiry);

            await mediator.Publish(expiryEvent, cancellationToken);
        }

        _logger.LogInformation("Expiry scan completed");
    }
}

