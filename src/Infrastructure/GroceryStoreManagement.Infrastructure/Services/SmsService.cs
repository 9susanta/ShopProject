using GroceryStoreManagement.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.Services;

public class SmsService : ISmsService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmsService> _logger;

    public SmsService(IConfiguration configuration, ILogger<SmsService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendSmsAsync(string phoneNumber, string message, CancellationToken cancellationToken = default)
    {
        try
        {
            var provider = _configuration["SmsSettings:Provider"] ?? "Twilio";
            var apiKey = _configuration["SmsSettings:ApiKey"];
            var apiSecret = _configuration["SmsSettings:ApiSecret"];
            var fromNumber = _configuration["SmsSettings:FromNumber"];

            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
            {
                _logger.LogWarning("SMS service not configured. Skipping SMS to {PhoneNumber}", phoneNumber);
                return false;
            }

            // Normalize phone number (remove spaces, add country code if needed)
            var normalizedPhone = NormalizePhoneNumber(phoneNumber);

            // For now, log the SMS (in production, integrate with Twilio, AWS SNS, or similar)
            _logger.LogInformation("SMS sent to {PhoneNumber}: {Message}", normalizedPhone, message);

            // TODO: Integrate with actual SMS provider
            // Example for Twilio:
            // var client = new TwilioRestClient(apiKey, apiSecret);
            // var result = await client.Messages.CreateAsync(
            //     new CreateMessageOptions(fromNumber) { To = normalizedPhone, Body = message }
            // );

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending SMS to {PhoneNumber}", phoneNumber);
            return false;
        }
    }

    public async Task<bool> SendWhatsAppAsync(string phoneNumber, string message, CancellationToken cancellationToken = default)
    {
        try
        {
            var provider = _configuration["WhatsAppSettings:Provider"] ?? "Twilio";
            var apiKey = _configuration["WhatsAppSettings:ApiKey"];
            var apiSecret = _configuration["WhatsAppSettings:ApiSecret"];
            var fromNumber = _configuration["WhatsAppSettings:FromNumber"];

            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
            {
                _logger.LogWarning("WhatsApp service not configured. Skipping WhatsApp to {PhoneNumber}", phoneNumber);
                return false;
            }

            var normalizedPhone = NormalizePhoneNumber(phoneNumber);

            _logger.LogInformation("WhatsApp sent to {PhoneNumber}: {Message}", normalizedPhone, message);

            // TODO: Integrate with actual WhatsApp provider (Twilio, WhatsApp Business API, etc.)
            // Example for Twilio WhatsApp:
            // var client = new TwilioRestClient(apiKey, apiSecret);
            // var result = await client.Messages.CreateAsync(
            //     new CreateMessageOptions($"whatsapp:{fromNumber}") 
            //     { 
            //         To = $"whatsapp:{normalizedPhone}", 
            //         Body = message 
            //     }
            // );

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending WhatsApp to {PhoneNumber}", phoneNumber);
            return false;
        }
    }

    public async Task<bool> SendNotificationAsync(string phoneNumber, string message, bool preferWhatsApp = false, CancellationToken cancellationToken = default)
    {
        if (preferWhatsApp)
        {
            var whatsAppResult = await SendWhatsAppAsync(phoneNumber, message, cancellationToken);
            if (whatsAppResult)
                return true;
            // Fallback to SMS if WhatsApp fails
            return await SendSmsAsync(phoneNumber, message, cancellationToken);
        }
        else
        {
            var smsResult = await SendSmsAsync(phoneNumber, message, cancellationToken);
            if (smsResult)
                return true;
            // Fallback to WhatsApp if SMS fails
            return await SendWhatsAppAsync(phoneNumber, message, cancellationToken);
        }
    }

    private string NormalizePhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return phoneNumber;

        // Remove spaces, dashes, parentheses
        var normalized = phoneNumber.Replace(" ", "")
                                   .Replace("-", "")
                                   .Replace("(", "")
                                   .Replace(")", "")
                                   .Trim();

        // Add country code if not present (assuming India +91)
        if (!normalized.StartsWith("+") && !normalized.StartsWith("91"))
        {
            if (normalized.Length == 10)
            {
                normalized = "+91" + normalized;
            }
        }
        else if (normalized.StartsWith("91") && normalized.Length == 12)
        {
            normalized = "+" + normalized;
        }

        return normalized;
    }
}

