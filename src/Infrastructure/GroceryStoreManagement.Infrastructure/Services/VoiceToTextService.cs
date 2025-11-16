using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.Services;

public interface IVoiceToTextService
{
    Task<string> TranscribeAsync(Stream audioStream, CancellationToken cancellationToken = default);
}

public class VoiceToTextService : IVoiceToTextService
{
    private readonly ILogger<VoiceToTextService> _logger;

    public VoiceToTextService(ILogger<VoiceToTextService> logger)
    {
        _logger = logger;
    }

    public Task<string> TranscribeAsync(Stream audioStream, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Mock voice-to-text transcription");
        // In a real implementation, this would use a speech-to-text service
        return Task.FromResult("Mock transcription result");
    }
}

