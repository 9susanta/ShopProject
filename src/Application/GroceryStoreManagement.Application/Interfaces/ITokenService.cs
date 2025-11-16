using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Interfaces;

/// <summary>
/// Service interface for JWT token generation and validation
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Generate a JWT access token for a user
    /// </summary>
    /// <param name="user">The user to generate token for</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>JWT access token string</returns>
    string GenerateAccessToken(User user);

    /// <summary>
    /// Generate a secure random refresh token
    /// </summary>
    /// <returns>Plaintext refresh token (to be hashed before storage)</returns>
    string GenerateRefreshToken();

    /// <summary>
    /// Validate a JWT access token
    /// </summary>
    /// <param name="token">The token to validate</param>
    /// <returns>True if valid, false otherwise</returns>
    bool ValidateToken(string token);

    /// <summary>
    /// Get user ID from a JWT token
    /// </summary>
    /// <param name="token">The token to extract user ID from</param>
    /// <returns>User ID or null if invalid</returns>
    Guid? GetUserIdFromToken(string token);

    /// <summary>
    /// Get user role from a JWT token
    /// </summary>
    /// <param name="token">The token to extract role from</param>
    /// <returns>User role or null if invalid</returns>
    string? GetUserRoleFromToken(string token);

    /// <summary>
    /// Get all claims from a JWT token
    /// </summary>
    /// <param name="token">The token to extract claims from</param>
    /// <returns>Dictionary of claims</returns>
    Dictionary<string, string> GetClaimsFromToken(string token);
}

