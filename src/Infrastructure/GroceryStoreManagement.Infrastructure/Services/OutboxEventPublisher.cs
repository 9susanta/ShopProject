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

        var unprocessedEvents = await context.OutboxEvents
            .Where(e => e.ProcessedAt == null && e.RetryCount < 3)
            .OrderBy(e => e.CreatedAt)
            .Take(10)
            .ToListAsync(cancellationToken);

        foreach (var outboxEvent in unprocessedEvents)
        {
            try
            {
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
    }
}

