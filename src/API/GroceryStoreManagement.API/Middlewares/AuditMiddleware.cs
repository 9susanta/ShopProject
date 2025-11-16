using System.Security.Claims;
using GroceryStoreManagement.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Http;

namespace GroceryStoreManagement.API.Middlewares;

/// <summary>
/// Middleware to capture request context for audit logging
/// Adds correlation ID, extracts user info, and captures request metadata
/// </summary>
public class AuditMiddleware
{
    private readonly RequestDelegate _next;
    private const string CORRELATION_ID_HEADER = "X-Correlation-Id";
    private const string CORRELATION_ID_ITEM_KEY = "CorrelationId";

    public AuditMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Generate or extract correlation ID
        var correlationId = context.Request.Headers[CORRELATION_ID_HEADER].FirstOrDefault()
            ?? Guid.NewGuid().ToString();

        // Store in HttpContext for use by services
        context.Items[CORRELATION_ID_ITEM_KEY] = correlationId;
        context.Response.Headers[CORRELATION_ID_HEADER] = correlationId;

        // Validate request size (prevent DoS)
        if (context.Request.ContentLength > 10_000_000) // 10MB limit
        {
            context.Response.StatusCode = 413; // Payload Too Large
            await context.Response.WriteAsync("Request payload too large");
            return;
        }

        // Check for suspicious content patterns (basic)
        if (context.Request.HasFormContentType)
        {
            var form = await context.Request.ReadFormAsync();
            foreach (var file in form.Files)
            {
                if (file.Length > 50_000_000) // 50MB per file
                {
                    context.Response.StatusCode = 413;
                    await context.Response.WriteAsync("File too large");
                    return;
                }
            }
        }

        await _next(context);
    }

    /// <summary>
    /// Get correlation ID from HttpContext
    /// </summary>
    public static string? GetCorrelationId(HttpContext context)
    {
        return context.Items[CORRELATION_ID_ITEM_KEY]?.ToString();
    }

    /// <summary>
    /// Get user ID from HttpContext claims
    /// </summary>
    public static Guid? GetUserId(HttpContext context)
    {
        var userIdClaim = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null && Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    /// <summary>
    /// Get username from HttpContext claims
    /// </summary>
    public static string? GetUserName(HttpContext context)
    {
        return context.User?.FindFirst(ClaimTypes.Name)?.Value
            ?? context.User?.FindFirst(ClaimTypes.Email)?.Value;
    }

    /// <summary>
    /// Get client IP address
    /// </summary>
    public static string? GetClientIp(HttpContext context)
    {
        // Check for forwarded IP (from proxy/load balancer)
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        return context.Connection.RemoteIpAddress?.ToString();
    }
}

