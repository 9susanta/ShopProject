using Microsoft.AspNetCore.Http;

namespace GroceryStoreManagement.API.Middlewares;

/// <summary>
/// Middleware to add security headers to HTTP responses
/// Implements OWASP security best practices
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLower() ?? "";
        
        // Skip strict security headers for Swagger UI
        var isSwagger = path.StartsWith("/swagger") || path.StartsWith("/swagger/");

        if (!isSwagger)
        {
            // HSTS - Force HTTPS
            context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";

            // Prevent clickjacking
            context.Response.Headers["X-Frame-Options"] = "DENY";

            // Prevent MIME type sniffing
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";

            // Referrer policy
            context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

            // Content Security Policy (minimal example - adjust based on your needs)
            context.Response.Headers["Content-Security-Policy"] = 
                "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";

            // Permissions Policy (formerly Feature-Policy)
            context.Response.Headers["Permissions-Policy"] = 
                "geolocation=(), microphone=(), camera=()";

            // X-XSS-Protection (legacy, but still useful for older browsers)
            context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
        }
        else
        {
            // Allow Swagger UI to work - use SAMEORIGIN for X-Frame-Options
            context.Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";
        }

        await _next(context);
    }
}

