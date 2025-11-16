using MediatR;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Events;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.EventHandlers;

/// <summary>
/// Handles LowStockEvent - sends notifications via SignalR and SMS/WhatsApp
/// </summary>
public class NotifyLowStockHandler : INotificationHandler<LowStockEvent>
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyLowStockHandler> _logger;

    public NotifyLowStockHandler(
        INotificationService notificationService,
        ILogger<NotifyLowStockHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(LowStockEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling low stock event for product: {ProductName}", notification.ProductName);

        await _notificationService.NotifyLowStockAsync(
            notification.ProductId,
            notification.ProductName,
            notification.CurrentStock,
            notification.Threshold,
            cancellationToken);
    }
}
