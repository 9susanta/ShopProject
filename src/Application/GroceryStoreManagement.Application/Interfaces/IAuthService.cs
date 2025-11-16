using GroceryStoreManagement.Application.DTOs.Auth;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Interfaces;

/// <summary>
/// Service interface for authentication operations including login, logout, and token refresh
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Authenticate a user with email and password
    /// </summary>
    /// <param name="request">Login request with email and password</param>
    /// <param name="clientIp">IP address of the client</param>
    /// <param name="deviceInfo">Device/user agent information</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Login response with access token and refresh token</returns>
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request, string? clientIp, string? deviceInfo, CancellationToken cancellationToken = default);

    /// <summary>
    /// Refresh an access token using a refresh token
    /// </summary>
    /// <param name="request">Refresh token request</param>
    /// <param name="clientIp">IP address of the client</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>New access token and refresh token</returns>
    Task<RefreshTokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request, string? clientIp, CancellationToken cancellationToken = default);

    /// <summary>
    /// Revoke a refresh token (logout)
    /// </summary>
    /// <param name="refreshToken">The refresh token to revoke</param>
    /// <param name="clientIp">IP address of the client</param>
    /// <param name="reason">Reason for revocation</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task RevokeTokenAsync(string refreshToken, string? clientIp, string? reason = "Logout", CancellationToken cancellationToken = default);

    /// <summary>
    /// Revoke all refresh tokens for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="clientIp">IP address of the client</param>
    /// <param name="reason">Reason for revocation</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task RevokeAllUserTokensAsync(Guid userId, string? clientIp, string? reason = "LogoutAll", CancellationToken cancellationToken = default);

    /// <summary>
    /// Unlock a locked user account
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task UnlockAccountAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Reset failed login attempts for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task ResetFailedLoginAttemptsAsync(Guid userId, CancellationToken cancellationToken = default);
}

