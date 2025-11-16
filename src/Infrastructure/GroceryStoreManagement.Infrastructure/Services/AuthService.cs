using System.Security.Cryptography;
using System.Text;
using System.Data;
using GroceryStoreManagement.Application.DTOs.Auth;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Infrastructure.Persistence;
using GroceryStoreManagement.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.Services;

/// <summary>
/// Authentication service with account lockout, refresh tokens, and secure password hashing
/// </summary>
public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    private readonly int _maxFailedAttempts;
    private readonly int _lockoutDurationMinutes;
    private readonly int _refreshTokenExpirationDays;

    public AuthService(
        ApplicationDbContext context,
        ITokenService tokenService,
        IPasswordHasher passwordHasher,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
        _logger = logger;

        _maxFailedAttempts = configuration.GetValue<int>("Security:MaxFailedLoginAttempts", 5);
        _lockoutDurationMinutes = configuration.GetValue<int>("Security:LockoutDurationMinutes", 15);
        _refreshTokenExpirationDays = configuration.GetValue<int>("Security:RefreshTokenExpirationDays", 7);
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request, string? clientIp, string? deviceInfo, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (user == null || !user.IsActive)
        {
            _logger.LogWarning("Login attempt with invalid email: {Email} from IP: {Ip}", request.Email, clientIp);
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Check if account is locked
        if (user.IsLocked())
        {
            _logger.LogWarning("Login attempt for locked account: {Email} from IP: {Ip}", request.Email, clientIp);
            throw new InvalidOperationException($"Account is locked until {user.LockoutUntil:yyyy-MM-dd HH:mm:ss} UTC");
        }

        // Verify password
        var isValid = _passwordHasher.VerifyPassword(
            request.Password,
            user.PasswordHash,
            user.PasswordHashAlgorithm,
            user.PasswordSalt,
            user.PasswordIterations);

        if (!isValid)
        {
            // Increment failed attempts
            user.IncrementFailedLoginAttempts();

            // Lock account if threshold reached
            if (user.FailedLoginAttempts >= _maxFailedAttempts)
            {
                var lockoutUntil = DateTime.UtcNow.AddMinutes(_lockoutDurationMinutes);
                user.LockAccount(lockoutUntil);
                _logger.LogWarning("Account locked due to {Attempts} failed login attempts: {Email}", user.FailedLoginAttempts, request.Email);
            }

            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogWarning("Failed login attempt for {Email} from IP: {Ip}. Attempts: {Attempts}", request.Email, clientIp, user.FailedLoginAttempts);
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Successful login - reset failed attempts and record login
        user.ResetFailedLoginAttempts();
        user.RecordLogin();
        await _context.SaveChangesAsync(cancellationToken);

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshTokenPlaintext = _tokenService.GenerateRefreshToken();
        var refreshTokenHash = HashRefreshToken(refreshTokenPlaintext);

        // Store refresh token
        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = refreshTokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenExpirationDays),
            CreatedByIp = clientIp,
            DeviceInfo = deviceInfo
        };

        await _context.Set<RefreshToken>().AddAsync(refreshToken, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Successful login for user {Email} from IP: {Ip}", user.Email, clientIp);

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenPlaintext, // Return plaintext only once
            ExpiresIn = 15 * 60, // 15 minutes in seconds
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role,
                Phone = user.Phone,
                IsActive = user.IsActive,
                LastLoginAt = user.LastLoginAt
            }
        };
    }

    public async Task<RefreshTokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request, string? clientIp, CancellationToken cancellationToken = default)
    {
        var refreshTokenHash = HashRefreshToken(request.RefreshToken);

        // Use a database transaction with serializable isolation to prevent race conditions
        // This ensures only one refresh operation can succeed for the same token
        using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, cancellationToken);
        
        try
        {
            // Re-query within transaction to get latest state (prevents race condition)
            var refreshToken = await _context.Set<RefreshToken>()
                .FirstOrDefaultAsync(rt => rt.TokenHash == refreshTokenHash, cancellationToken);

            if (refreshToken == null || !refreshToken.IsActive)
            {
                await transaction.RollbackAsync(cancellationToken);
                _logger.LogWarning("Invalid or expired refresh token attempt from IP: {Ip}", clientIp);
                throw new UnauthorizedAccessException("Invalid or expired refresh token");
            }

            // Get user
            var user = await _context.Users.FindAsync(new object[] { refreshToken.UserId }, cancellationToken);
            if (user == null || !user.IsActive)
            {
                await transaction.RollbackAsync(cancellationToken);
                _logger.LogWarning("Refresh token for inactive user: {UserId}", refreshToken.UserId);
                throw new UnauthorizedAccessException("User not found or inactive");
            }

            // Revoke old token (atomic operation within transaction)
            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.RevokedByIp = clientIp;
            refreshToken.RevocationReason = "Replaced by new token";

            // Generate new tokens
            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var newRefreshTokenPlaintext = _tokenService.GenerateRefreshToken();
            var newRefreshTokenHash = HashRefreshToken(newRefreshTokenPlaintext);

            // Create new refresh token
            var newRefreshToken = new RefreshToken
            {
                UserId = user.Id,
                TokenHash = newRefreshTokenHash,
                ExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenExpirationDays),
                CreatedByIp = clientIp,
                ReplacedByTokenId = refreshToken.Id
            };

            await _context.Set<RefreshToken>().AddAsync(newRefreshToken, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation("Token refreshed for user {Email}", user.Email);

            return new RefreshTokenResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshTokenPlaintext,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Role = user.Role,
                    Phone = user.Phone,
                    IsActive = user.IsActive,
                    LastLoginAt = user.LastLoginAt
                }
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogError(ex, "Error refreshing token for IP: {Ip}", clientIp);
            throw;
        }
    }

    public async Task RevokeTokenAsync(string refreshToken, string? clientIp, string? reason = "Logout", CancellationToken cancellationToken = default)
    {
        var refreshTokenHash = HashRefreshToken(refreshToken);

        var token = await _context.Set<RefreshToken>()
            .FirstOrDefaultAsync(rt => rt.TokenHash == refreshTokenHash && rt.IsActive, cancellationToken);

        if (token != null)
        {
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = clientIp;
            token.RevocationReason = reason;
            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Refresh token revoked for user {UserId}. Reason: {Reason}", token.UserId, reason);
        }
    }

    public async Task RevokeAllUserTokensAsync(Guid userId, string? clientIp, string? reason = "LogoutAll", CancellationToken cancellationToken = default)
    {
        var activeTokens = await _context.Set<RefreshToken>()
            .Where(rt => rt.UserId == userId && rt.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = clientIp;
            token.RevocationReason = reason;
        }

        if (activeTokens.Any())
        {
            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("All refresh tokens revoked for user {UserId}. Count: {Count}", userId, activeTokens.Count);
        }
    }

    public async Task UnlockAccountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null)
            throw new InvalidOperationException("User not found");

        user.UnlockAccount();
        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Account unlocked for user {UserId}", userId);
    }

    public async Task ResetFailedLoginAttemptsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null)
            throw new InvalidOperationException("User not found");

        user.ResetFailedLoginAttempts();
        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Failed login attempts reset for user {UserId}", userId);
    }

    /// <summary>
    /// Hash refresh token using HMAC-SHA256 (raw token never stored)
    /// </summary>
    private string HashRefreshToken(string token)
    {
        var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"] ?? "DefaultSecretKey");
        using var hmac = new HMACSHA256(key);
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(hashBytes);
    }
}

