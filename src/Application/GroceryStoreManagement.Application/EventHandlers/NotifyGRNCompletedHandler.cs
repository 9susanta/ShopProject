using MediatR;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Events;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.EventHandlers;

/// <summary>
/// Handles GRNConfirmedEvent - sends notifications via SignalR
/// </summary>
public class NotifyGRNCompletedHandler : INotificationHandler<GRNConfirmedEvent>
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyGRNCompletedHandler> _logger;

    public NotifyGRNCompletedHandler(
        INotificationService notificationService,
        ILogger<NotifyGRNCompletedHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(GRNConfirmedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling GRN confirmed event: {GRNNumber}", notification.GRNNumber);

        await _notificationService.NotifyGRNCompletedAsync(
            notification.GRNId,
            notification.GRNNumber,
            notification.TotalAmount,
            cancellationToken);
    }
}

