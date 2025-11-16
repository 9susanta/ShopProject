using MediatR;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Events;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.EventHandlers;

/// <summary>
/// Handles ExpirySoonEvent - sends notifications via SignalR
/// </summary>
public class NotifyExpirySoonHandler : INotificationHandler<ExpirySoonEvent>
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyExpirySoonHandler> _logger;

    public NotifyExpirySoonHandler(
        INotificationService notificationService,
        ILogger<NotifyExpirySoonHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ExpirySoonEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling expiry soon event for product: {ProductName}", notification.ProductName);

        await _notificationService.NotifyExpirySoonAsync(
            notification.ProductId,
            notification.ProductName,
            notification.ExpiryDate,
            0, // Quantity not available in event, would need to fetch from batch
            cancellationToken);
    }
}

