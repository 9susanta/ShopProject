using GroceryStoreManagement.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.Services;

// Note: This class uses IHubContext<THub> where THub : Hub
// The actual hub type is injected via factory in API DI
public class NotificationService<THub> : INotificationService where THub : Hub
{
    private readonly IHubContext<THub> _hubContext;
    private readonly ILogger<NotificationService<THub>> _logger;

    public NotificationService(
        IHubContext<THub> hubContext,
        ILogger<NotificationService<THub>> logger)
    {
        _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
        _logger = logger;
    }

    public async Task NotifyLowStockAsync(Guid productId, string productName, int availableQuantity, int threshold, CancellationToken cancellationToken = default)
    {
        try
        {
            await _hubContext.Clients.Group("inventory-updates").SendAsync("LowStock", new
            {
                ProductId = productId,
                ProductName = productName,
                AvailableQuantity = availableQuantity,
                Threshold = threshold,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);

            _logger.LogInformation("Low stock notification sent for product: {ProductName}", productName);

            // TODO: Send SMS/WhatsApp notification (stub)
            // await SendSMSNotificationAsync(...);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending low stock notification");
        }
    }

    public async Task NotifyGRNCompletedAsync(Guid grnId, string grnNumber, decimal totalAmount, CancellationToken cancellationToken = default)
    {
        try
        {
            await _hubContext.Clients.Group("inventory-updates").SendAsync("GRNCompleted", new
            {
                GRNId = grnId,
                GRNNumber = grnNumber,
                TotalAmount = totalAmount,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);

            _logger.LogInformation("GRN completed notification sent: {GRNNumber}", grnNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending GRN completed notification");
        }
    }

    public async Task NotifyExpirySoonAsync(Guid productId, string productName, DateTime expiryDate, int quantity, CancellationToken cancellationToken = default)
    {
        try
        {
            await _hubContext.Clients.Group("inventory-updates").SendAsync("ExpirySoon", new
            {
                ProductId = productId,
                ProductName = productName,
                ExpiryDate = expiryDate,
                Quantity = quantity,
                DaysUntilExpiry = (expiryDate - DateTime.UtcNow).Days,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);

            _logger.LogInformation("Expiry soon notification sent for product: {ProductName}", productName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending expiry soon notification");
        }
    }
}

