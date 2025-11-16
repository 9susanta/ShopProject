namespace GroceryStoreManagement.Application.Interfaces;

/// <summary>
/// Service interface for rate limiting
/// </summary>
public interface IRateLimitService
{
    /// <summary>
    /// Check if a request is allowed based on rate limit
    /// </summary>
    /// <param name="key">Rate limit key (e.g., IP address or user ID)</param>
    /// <param name="maxRequests">Maximum number of requests allowed</param>
    /// <param name="window">Time window for the limit</param>
    /// <returns>True if allowed, false if rate limited</returns>
    bool IsAllowed(string key, int maxRequests, TimeSpan window);

    /// <summary>
    /// Get rate limit information
    /// </summary>
    /// <param name="key">Rate limit key</param>
    /// <param name="maxRequests">Maximum number of requests allowed</param>
    /// <param name="window">Time window for the limit</param>
    /// <returns>Rate limit information</returns>
    RateLimitInfo GetRateLimitInfo(string key, int maxRequests, TimeSpan window);

    /// <summary>
    /// Reset rate limit for a key
    /// </summary>
    /// <param name="key">Rate limit key</param>
    /// <param name="window">Time window</param>
    void Reset(string key, TimeSpan window);
}

/// <summary>
/// Rate limit information
/// </summary>
public class RateLimitInfo
{
    public int Remaining { get; set; }
    public DateTime ResetAt { get; set; }
}

