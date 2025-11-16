using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GroceryStoreManagement.Infrastructure.Persistence.Entities;

/// <summary>
/// Represents a refresh token used for JWT token refresh flow.
/// Tokens are stored hashed (HMAC-SHA256) for security.
/// </summary>
[Table("RefreshTokens")]
[Index(nameof(UserId))]
[Index(nameof(TokenHash))]
[Index(nameof(ExpiresAt))]
[Index(nameof(RevokedAt))]
public class RefreshToken
{
    /// <summary>
    /// Unique identifier for the refresh token record
    /// </summary>
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// ID of the user who owns this refresh token
    /// </summary>
    [Required]
    public Guid UserId { get; set; }

    /// <summary>
    /// HMAC-SHA256 hash of the refresh token (raw token never stored)
    /// </summary>
    [Required]
    [MaxLength(256)]
    public string TokenHash { get; set; } = string.Empty;

    /// <summary>
    /// UTC timestamp when the token expires
    /// </summary>
    [Required]
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// UTC timestamp when the token was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// UTC timestamp when the token was revoked (null if still active)
    /// </summary>
    public DateTime? RevokedAt { get; set; }

    /// <summary>
    /// IP address of the client that created this token
    /// </summary>
    [MaxLength(50)]
    public string? CreatedByIp { get; set; }

    /// <summary>
    /// IP address of the client that revoked this token
    /// </summary>
    [MaxLength(50)]
    public string? RevokedByIp { get; set; }

    /// <summary>
    /// Device or user agent information
    /// </summary>
    [MaxLength(500)]
    public string? DeviceInfo { get; set; }

    /// <summary>
    /// ID of the refresh token that replaced this one (for token rotation)
    /// </summary>
    public Guid? ReplacedByTokenId { get; set; }

    /// <summary>
    /// Reason for revocation (if revoked)
    /// </summary>
    [MaxLength(200)]
    public string? RevocationReason { get; set; }

    /// <summary>
    /// Check if the token is expired
    /// </summary>
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

    /// <summary>
    /// Check if the token is revoked
    /// </summary>
    public bool IsRevoked => RevokedAt.HasValue;

    /// <summary>
    /// Check if the token is active (not expired and not revoked)
    /// </summary>
    public bool IsActive => !IsExpired && !IsRevoked;
}

