using MediatR;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Events;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.EventHandlers;

public class NotifyLowStockHandler : INotificationHandler<LowStockEvent>
{
    private readonly IEventBus _eventBus;
    private readonly ILogger<NotifyLowStockHandler> _logger;

    public NotifyLowStockHandler(
        IEventBus eventBus,
        ILogger<NotifyLowStockHandler> logger)
    {
        _eventBus = eventBus;
        _logger = logger;
    }

    public async Task Handle(LowStockEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Low stock alert: Product {ProductName} (SKU: {SKU}) has {CurrentStock} units, threshold: {Threshold}",
            notification.ProductName,
            notification.SKU,
            notification.CurrentStock,
            notification.Threshold);

        // In a real implementation, this would send email/SMS/WhatsApp
        // For now, we'll just log and publish to event bus
        await _eventBus.PublishAsync(notification, cancellationToken);

        _logger.LogInformation("Low stock notification sent for product: {ProductId}", notification.ProductId);
    }
}

