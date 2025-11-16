using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.BackgroundServices;

/// <summary>
/// Background service that publishes outbox events to event bus
/// Scaffold implementation - can be extended for RabbitMQ/Kafka
/// </summary>
public class OutboxPublisher : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<OutboxPublisher> _logger;
    private readonly TimeSpan _publishInterval = TimeSpan.FromSeconds(30); // Check every 30 seconds

    public OutboxPublisher(
        IServiceProvider serviceProvider,
        ILogger<OutboxPublisher> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("OutboxPublisher started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await PublishOutboxEventsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OutboxPublisher");
            }

            await Task.Delay(_publishInterval, stoppingToken);
        }

        _logger.LogInformation("OutboxPublisher stopped");
    }

    private async Task PublishOutboxEventsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var outboxRepository = scope.ServiceProvider.GetRequiredService<IRepository<OutboxEvent>>();
        var eventBus = scope.ServiceProvider.GetRequiredService<IEventBus>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        // Get unpublished events
        var unpublishedEvents = (await outboxRepository.FindAsync(
            e => e.ProcessedAt == null,
            cancellationToken)).Take(100).ToList(); // Process in batches

        if (!unpublishedEvents.Any())
            return;

        _logger.LogInformation("Publishing {Count} outbox events", unpublishedEvents.Count);

        foreach (var outboxEvent in unpublishedEvents)
        {
            try
            {
                // Publish to in-memory event bus
                // In production, this would publish to RabbitMQ/Kafka
                // Note: This is a scaffold - would need to deserialize payload and publish typed event
                // For now, we'll just mark as processed
                // await eventBus.PublishAsync(deserializedEvent, cancellationToken);

                // Mark as processed
                outboxEvent.MarkAsProcessed();
                await outboxRepository.UpdateAsync(outboxEvent, cancellationToken);

                _logger.LogDebug("Published outbox event: {EventId}", outboxEvent.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing outbox event: {EventId}", outboxEvent.Id);
                // Increment retry count, mark as failed after max retries
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

