namespace GroceryStoreManagement.Application.Interfaces;

public interface ISmsService
{
    /// <summary>
    /// Send SMS to a phone number
    /// </summary>
    Task<bool> SendSmsAsync(string phoneNumber, string message, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send WhatsApp message (if configured)
    /// </summary>
    Task<bool> SendWhatsAppAsync(string phoneNumber, string message, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send SMS or WhatsApp based on customer preference
    /// </summary>
    Task<bool> SendNotificationAsync(string phoneNumber, string message, bool preferWhatsApp = false, CancellationToken cancellationToken = default);
}

