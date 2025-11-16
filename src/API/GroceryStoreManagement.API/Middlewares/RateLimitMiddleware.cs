using GroceryStoreManagement.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace GroceryStoreManagement.API.Middlewares;

/// <summary>
/// Middleware for rate limiting sensitive endpoints
/// </summary>
public class RateLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IRateLimitService _rateLimitService;
    private readonly IConfiguration _configuration;

    public RateLimitMiddleware(
        RequestDelegate next,
        IRateLimitService rateLimitService,
        IConfiguration configuration)
    {
        _next = next;
        _rateLimitService = rateLimitService;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Only apply rate limiting to sensitive endpoints
        var path = context.Request.Path.Value?.ToLower() ?? "";
        if (!IsSensitiveEndpoint(path))
        {
            await _next(context);
            return;
        }

        // Get client identifier (IP address or user ID)
        var clientId = GetClientIdentifier(context);
        var maxRequests = _configuration.GetValue<int>("RateLimit:MaxRequests", 5);
        var windowMinutes = _configuration.GetValue<int>("RateLimit:WindowMinutes", 15);
        var window = TimeSpan.FromMinutes(windowMinutes);

        if (!_rateLimitService.IsAllowed(clientId, maxRequests, window))
        {
            var rateLimitInfo = _rateLimitService.GetRateLimitInfo(clientId, maxRequests: maxRequests, window);
            
            context.Response.StatusCode = 429; // Too Many Requests
            context.Response.Headers.Add("X-RateLimit-Limit", maxRequests.ToString());
            context.Response.Headers.Add("X-RateLimit-Remaining", rateLimitInfo.Remaining.ToString());
            context.Response.Headers.Add("X-RateLimit-Reset", new DateTimeOffset(rateLimitInfo.ResetAt).ToUnixTimeSeconds().ToString());
            context.Response.Headers.Add("Retry-After", ((int)(rateLimitInfo.ResetAt - DateTime.UtcNow).TotalSeconds).ToString());
            
            await context.Response.WriteAsync("Rate limit exceeded. Please try again later.");
            return;
        }

        // Add rate limit headers to response
        var info = _rateLimitService.GetRateLimitInfo(clientId, maxRequests, window);
        context.Response.Headers.Add("X-RateLimit-Limit", maxRequests.ToString());
        context.Response.Headers.Add("X-RateLimit-Remaining", info.Remaining.ToString());
        context.Response.Headers.Add("X-RateLimit-Reset", new DateTimeOffset(info.ResetAt).ToUnixTimeSeconds().ToString());

        await _next(context);
    }

    private bool IsSensitiveEndpoint(string path)
    {
        var sensitivePaths = new[]
        {
            "/api/auth/login",
            "/api/auth/otp",
            "/api/auth/refresh"
        };

        return sensitivePaths.Any(p => path.Contains(p, StringComparison.OrdinalIgnoreCase));
    }

    private string GetClientIdentifier(HttpContext context)
    {
        // Try to get user ID first (if authenticated)
        var userId = context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            return $"user:{userId}";
        }

        // Fallback to IP address
        var ip = AuditMiddleware.GetClientIp(context) ?? "unknown";
        return $"ip:{ip}";
    }
}

