using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.DTOs.Auth;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;

namespace GroceryStoreManagement.API.Controllers;

/// <summary>
/// User management controller - Only SuperAdmin and Admin can manage users
/// </summary>
[ApiController]
[Route("api/users")]
[Authorize(Policy = "AdminOnly")]
public class UsersController : ControllerBase
{
    private readonly IRepository<User> _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IRepository<User> userRepository,
        IPasswordHasher passwordHasher,
        IUnitOfWork unitOfWork,
        ILogger<UsersController> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Get all users (Admin and SuperAdmin only)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers(CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        return Ok(users.Select(u => new UserDto
        {
            Id = u.Id,
            Email = u.Email,
            Name = u.Name,
            Role = u.Role,
            Phone = u.Phone,
            IsActive = u.IsActive,
            LastLoginAt = u.LastLoginAt,
            FailedLoginAttempts = u.FailedLoginAttempts,
            LockoutUntil = u.LockoutUntil,
            IsLocked = u.IsLocked()
        }).ToList());
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUserById(Guid id, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role,
            Phone = user.Phone,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt,
            FailedLoginAttempts = user.FailedLoginAttempts,
            LockoutUntil = user.LockoutUntil,
            IsLocked = user.IsLocked()
        });
    }

    /// <summary>
    /// Create a new user (Only SuperAdmin can create other SuperAdmins and Admins)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequestDto request, CancellationToken cancellationToken)
    {
        // Check if current user is SuperAdmin (only SuperAdmin can create Admins and SuperAdmins)
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;
        var isSuperAdmin = currentUserRole == UserRole.SuperAdmin.ToString();

        if ((request.Role == UserRole.SuperAdmin || request.Role == UserRole.Admin) && !isSuperAdmin)
        {
            return Forbid("Only SuperAdmin can create Admin and SuperAdmin users");
        }

        // Check if email already exists
        var existingUsers = await _userRepository.FindAsync(
            u => u.Email.ToLower() == request.Email.ToLower(),
            cancellationToken);

        if (existingUsers.Any())
        {
            return Conflict(new { message = "Email already exists" });
        }

        // Check if phone already exists (if provided)
        if (!string.IsNullOrWhiteSpace(request.Phone))
        {
            var existingPhoneUsers = await _userRepository.FindAsync(
                u => u.Phone == request.Phone,
                cancellationToken);

            if (existingPhoneUsers.Any())
            {
                return Conflict(new { message = "Phone number already exists" });
            }
        }

            var passwordHashResult = _passwordHasher.HashPassword(request.Password);
            var user = new User(request.Email, request.Name, passwordHashResult.Hash, request.Role, request.Phone);
            user.SetPasswordMetadata(passwordHashResult.Algorithm, passwordHashResult.Salt, passwordHashResult.Iterations);

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {Email} created by {CurrentUser}", user.Email, User.FindFirst(ClaimTypes.Email)?.Value);

        return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role,
            Phone = user.Phone,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt
        });
    }

    /// <summary>
    /// Update user (Only SuperAdmin can change roles)
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserRequestDto request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;
        var isSuperAdmin = currentUserRole == UserRole.SuperAdmin.ToString();

        // Only SuperAdmin can change roles
        if (request.Role.HasValue && request.Role.Value != user.Role && !isSuperAdmin)
        {
            return Forbid("Only SuperAdmin can change user roles");
        }

        // Only SuperAdmin can change SuperAdmin or Admin roles
        if (request.Role.HasValue && (request.Role.Value == UserRole.SuperAdmin || request.Role.Value == UserRole.Admin) && !isSuperAdmin)
        {
            return Forbid("Only SuperAdmin can assign Admin or SuperAdmin roles");
        }

        // Update user
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            user.Update(request.Name, request.Phone);
        }

        if (request.Role.HasValue && isSuperAdmin)
        {
            user.ChangeRole(request.Role.Value);
        }

        if (request.IsActive.HasValue)
        {
            if (request.IsActive.Value)
                user.Activate();
            else
                user.Deactivate();
        }

        await _userRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {Email} updated by {CurrentUser}", user.Email, User.FindFirst(ClaimTypes.Email)?.Value);

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role,
            Phone = user.Phone,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt,
            FailedLoginAttempts = user.FailedLoginAttempts,
            LockoutUntil = user.LockoutUntil,
            IsLocked = user.IsLocked()
        });
    }

    /// <summary>
    /// Delete user (Soft delete by deactivating)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult> DeleteUser(Guid id, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Prevent deleting yourself
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == user.Id.ToString())
        {
            return BadRequest(new { message = "Cannot delete your own account" });
        }

        user.Deactivate();
        await _userRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {Email} deactivated by {CurrentUser}", user.Email, User.FindFirst(ClaimTypes.Email)?.Value);

        return NoContent();
    }

    /// <summary>
    /// Change user password
    /// </summary>
    [HttpPost("{id}/change-password")]
    public async Task<ActionResult> ChangePassword(Guid id, [FromBody] ChangePasswordRequestDto request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Users can only change their own password unless they are SuperAdmin
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;
        var isSuperAdmin = currentUserRole == UserRole.SuperAdmin.ToString();

        if (currentUserId != user.Id.ToString() && !isSuperAdmin)
        {
            return Forbid("You can only change your own password");
        }

        // Verify current password (unless SuperAdmin changing someone else's password)
        if (currentUserId == user.Id.ToString() && !_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Current password is incorrect" });
        }

        var passwordHashResult = _passwordHasher.HashPassword(request.NewPassword);
        user.ChangePassword(passwordHashResult.Hash);
        user.SetPasswordMetadata(passwordHashResult.Algorithm, passwordHashResult.Salt, passwordHashResult.Iterations);

        await _userRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Password changed for user {Email} by {CurrentUser}", user.Email, User.FindFirst(ClaimTypes.Email)?.Value);

        return NoContent();
    }

    /// <summary>
    /// Unlock a locked user account
    /// </summary>
    [HttpPost("{id}/unlock")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> UnlockAccount(Guid id, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        if (!user.LockoutUntil.HasValue)
        {
            return Ok(new { message = "Account is not locked" });
        }

        var authService = HttpContext.RequestServices.GetRequiredService<IAuthService>();
        await authService.UnlockAccountAsync(id, cancellationToken);

        _logger.LogInformation("Account unlocked for user {Email} by {CurrentUser}", 
            user.Email, User.FindFirst(ClaimTypes.Email)?.Value);

        return Ok(new { message = "Account unlocked successfully" });
    }

    /// <summary>
    /// Reset failed login attempts for a user
    /// </summary>
    [HttpPost("{id}/reset-failed-attempts")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> ResetFailedLoginAttempts(Guid id, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var authService = HttpContext.RequestServices.GetRequiredService<IAuthService>();
        await authService.ResetFailedLoginAttemptsAsync(id, cancellationToken);

        _logger.LogInformation("Failed login attempts reset for user {Email} by {CurrentUser}", 
            user.Email, User.FindFirst(ClaimTypes.Email)?.Value);

        return Ok(new { message = "Failed login attempts reset successfully" });
    }

    /// <summary>
    /// Get user lockout status
    /// </summary>
    [HttpGet("{id}/lockout-status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<object>> GetLockoutStatus(Guid id, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var isLocked = user.IsLocked();
        var remainingMinutes = 0;
        if (user.LockoutUntil.HasValue && isLocked)
        {
            remainingMinutes = (int)Math.Ceiling((user.LockoutUntil.Value - DateTime.UtcNow).TotalMinutes);
        }

        return Ok(new
        {
            isLocked,
            failedLoginAttempts = user.FailedLoginAttempts,
            lockoutUntil = user.LockoutUntil,
            remainingMinutes = isLocked ? remainingMinutes : 0,
            willAutoUnlock = user.LockoutUntil.HasValue && !isLocked
        });
    }
}

