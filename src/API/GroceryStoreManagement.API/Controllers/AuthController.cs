using GroceryStoreManagement.Application.DTOs.Auth;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.API.Middlewares;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GroceryStoreManagement.API.Controllers;

/// <summary>
/// Authentication controller with enhanced security features
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(
        [FromBody] LoginRequestDto request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var clientIp = AuditMiddleware.GetClientIp(HttpContext);
            var deviceInfo = HttpContext.Request.Headers["User-Agent"].ToString();

            var response = await _authService.LoginAsync(request, clientIp, deviceInfo, cancellationToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Login failed: {Message}", ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Login blocked: {Message}", ex.Message);
            return StatusCode(423, new { message = ex.Message }); // 423 Locked
        }
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    [HttpPost("refresh")]
    public async Task<ActionResult<RefreshTokenResponseDto>> RefreshToken(
        [FromBody] RefreshTokenRequestDto request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var clientIp = AuditMiddleware.GetClientIp(HttpContext);
            var response = await _authService.RefreshTokenAsync(request, clientIp, cancellationToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Token refresh failed: {Message}", ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Logout - revoke refresh token
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult> Logout(
        [FromBody] RefreshTokenRequestDto? request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var clientIp = AuditMiddleware.GetClientIp(HttpContext);

            if (request != null && !string.IsNullOrEmpty(request.RefreshToken))
            {
                // Revoke specific token
                await _authService.RevokeTokenAsync(request.RefreshToken, clientIp, "Logout", cancellationToken);
            }
            else
            {
                // Revoke all tokens for current user
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                await _authService.RevokeAllUserTokensAsync(userId, clientIp, "LogoutAll", cancellationToken);
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Logout failed");
            return StatusCode(500, new { message = "Logout failed" });
        }
    }

    /// <summary>
    /// Get current user information
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser(CancellationToken cancellationToken = default)
    {
        // This would typically come from the token claims, but for completeness:
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        // Return user info from token claims (or fetch from DB if needed)
        return Ok(new UserDto
        {
            Id = Guid.Parse(userId),
            Email = User.FindFirst(ClaimTypes.Email)?.Value ?? "",
            Name = User.FindFirst(ClaimTypes.Name)?.Value ?? "",
            Role = Enum.Parse<GroceryStoreManagement.Domain.Enums.UserRole>(User.FindFirst(ClaimTypes.Role)?.Value ?? "Staff")
        });
    }
}

