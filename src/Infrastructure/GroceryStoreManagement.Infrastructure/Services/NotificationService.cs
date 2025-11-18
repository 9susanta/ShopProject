using GroceryStoreManagement.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.Services;

// Note: This class uses IHubContext<THub> where THub : Hub
// The actual hub type is injected via factory in API DI
public class NotificationService<THub> : INotificationService where THub : Hub
{
    private readonly IHubContext<THub> _hubContext;
    private readonly ISmsService _smsService;
    private readonly ILogger<NotificationService<THub>> _logger;

    public NotificationService(
        IHubContext<THub> hubContext,
        ISmsService smsService,
        ILogger<NotificationService<THub>> logger)
    {
        _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
        _smsService = smsService;
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

            // Send SMS/WhatsApp to admin (if configured)
            var adminPhone = Environment.GetEnvironmentVariable("ADMIN_PHONE");
            if (!string.IsNullOrEmpty(adminPhone))
            {
                var message = $"Low stock alert: {productName} has only {availableQuantity} units left (threshold: {threshold})";
                await _smsService.SendNotificationAsync(adminPhone, message, false, cancellationToken);
            }
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

            // Send SMS/WhatsApp to admin (if configured)
            var adminPhone = Environment.GetEnvironmentVariable("ADMIN_PHONE");
            if (!string.IsNullOrEmpty(adminPhone))
            {
                var daysUntilExpiry = (expiryDate - DateTime.UtcNow).Days;
                var message = $"Expiry alert: {productName} (Qty: {quantity}) expires in {daysUntilExpiry} days on {expiryDate:dd MMM yyyy}";
                await _smsService.SendNotificationAsync(adminPhone, message, false, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending expiry soon notification");
        }
    }

    public async Task NotifySaleCompletedAsync(string customerPhone, string invoiceNumber, decimal totalAmount, int? loyaltyPointsEarned, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(customerPhone))
                return;

            var message = $"Thank you for your purchase! Invoice: {invoiceNumber}, Amount: ₹{totalAmount:F2}";
            if (loyaltyPointsEarned.HasValue && loyaltyPointsEarned.Value > 0)
            {
                message += $". You earned {loyaltyPointsEarned.Value} loyalty points!";
            }

            await _smsService.SendNotificationAsync(customerPhone, message, false, cancellationToken);
            _logger.LogInformation("Sale completion notification sent to {Phone} for invoice {InvoiceNumber}", customerPhone, invoiceNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending sale completion notification to {Phone}", customerPhone);
        }
    }

    public async Task NotifyOrderReadyAsync(string customerPhone, string orderNumber, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(customerPhone))
                return;

            var message = $"Your order {orderNumber} is ready for pickup! Thank you for shopping with us.";
            await _smsService.SendNotificationAsync(customerPhone, message, false, cancellationToken);
            _logger.LogInformation("Order ready notification sent to {Phone} for order {OrderNumber}", customerPhone, orderNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending order ready notification to {Phone}", customerPhone);
        }
    }
}

