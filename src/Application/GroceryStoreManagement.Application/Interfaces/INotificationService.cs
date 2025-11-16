namespace GroceryStoreManagement.Application.Interfaces;

public interface INotificationService
{
    Task NotifyLowStockAsync(Guid productId, string productName, int availableQuantity, int threshold, CancellationToken cancellationToken = default);
    Task NotifyGRNCompletedAsync(Guid grnId, string grnNumber, decimal totalAmount, CancellationToken cancellationToken = default);
    Task NotifyExpirySoonAsync(Guid productId, string productName, DateTime expiryDate, int quantity, CancellationToken cancellationToken = default);
}

