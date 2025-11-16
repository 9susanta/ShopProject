using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default);
}

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Mock Email sent to {To} with subject: {Subject}", to, subject);
        // In a real implementation, this would send an actual email
        return Task.CompletedTask;
    }
}

