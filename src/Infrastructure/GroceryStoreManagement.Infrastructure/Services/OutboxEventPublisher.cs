using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace GroceryStoreManagement.Infrastructure.Services;

public class OutboxEventPublisher : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<OutboxEventPublisher> _logger;
    private readonly TimeSpan _pollingInterval = TimeSpan.FromSeconds(5);

    public OutboxEventPublisher(
        IServiceProvider serviceProvider,
        ILogger<OutboxEventPublisher> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Outbox event publisher started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessOutboxEventsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing outbox events");
            }

            await Task.Delay(_pollingInterval, stoppingToken);
        }

        _logger.LogInformation("Outbox event publisher stopped");
    }

    private async Task ProcessOutboxEventsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var eventBus = scope.ServiceProvider.GetRequiredService<IEventBus>();

        // Use database transaction with serializable isolation to prevent concurrent processing
        // This ensures only one instance can process the same events
        using var transaction = await context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, cancellationToken);
        
        try
        {
            // Use SELECT FOR UPDATE (pessimistic locking) to prevent concurrent processing
            // Note: EF Core doesn't have direct SELECT FOR UPDATE, so we use transaction isolation
            // In production, consider using raw SQL: SELECT * FROM OutboxEvents WHERE ... FOR UPDATE
            var unprocessedEvents = await context.OutboxEvents
                .Where(e => e.ProcessedAt == null && e.RetryCount < 3)
                .OrderBy(e => e.CreatedAt)
                .Take(10)
                .ToListAsync(cancellationToken);

            foreach (var outboxEvent in unprocessedEvents)
            {
                try
                {
                    // Re-check within transaction to ensure event is still unprocessed
                    // (prevents race condition if another instance processed it)
                    var eventStillUnprocessed = await context.OutboxEvents
                        .AnyAsync(e => e.Id == outboxEvent.Id && e.ProcessedAt == null, cancellationToken);
                    
                    if (!eventStillUnprocessed)
                    {
                        _logger.LogWarning("Outbox event {EventId} was already processed by another instance", outboxEvent.Id);
                        continue;
                    }

                    // In a real implementation, we would deserialize and publish to external event bus (RabbitMQ, etc.)
                    _logger.LogInformation("Processing outbox event: {EventType}, {EventId}", outboxEvent.EventType, outboxEvent.Id);

                    // For now, we'll just mark as processed
                    // In production, this would publish to RabbitMQ/Kafka/etc.
                    outboxEvent.MarkAsProcessed();
                    await context.SaveChangesAsync(cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing outbox event: {EventId}", outboxEvent.Id);
                    outboxEvent.MarkAsFailed(ex.Message);
                    await context.SaveChangesAsync(cancellationToken);
                }
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogError(ex, "Error in outbox event processing transaction");
            throw;
        }
    }
}

