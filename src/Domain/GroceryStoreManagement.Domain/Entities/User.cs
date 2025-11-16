using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public UserRole Role { get; private set; } = UserRole.Staff;
    public string? Phone { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime? LastLoginAt { get; private set; }
    public int FailedLoginAttempts { get; private set; } = 0;
    public DateTime? LockoutUntil { get; private set; }
    public string? PasswordHashAlgorithm { get; private set; } // e.g., "Argon2id", "PBKDF2"
    public string? PasswordSalt { get; private set; } // For PBKDF2
    public int? PasswordIterations { get; private set; } // For PBKDF2

    private User() { } // EF Core

    public User(string email, string name, string passwordHash, UserRole role, string? phone = null)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be null or empty", nameof(email));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));

        if (string.IsNullOrWhiteSpace(passwordHash))
            throw new ArgumentException("Password hash cannot be null or empty", nameof(passwordHash));

        Email = email.ToLowerInvariant();
        Name = name;
        PasswordHash = passwordHash;
        Role = role;
        Phone = phone;
    }

    public void Update(string name, string? phone = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));

        Name = name;
        Phone = phone;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ChangePassword(string newPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(newPasswordHash))
            throw new ArgumentException("Password hash cannot be null or empty", nameof(newPasswordHash));

        PasswordHash = newPasswordHash;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ChangeRole(UserRole newRole)
    {
        Role = newRole;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void IncrementFailedLoginAttempts()
    {
        FailedLoginAttempts++;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ResetFailedLoginAttempts()
    {
        FailedLoginAttempts = 0;
        LockoutUntil = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void LockAccount(DateTime lockoutUntil)
    {
        LockoutUntil = lockoutUntil;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UnlockAccount()
    {
        LockoutUntil = null;
        FailedLoginAttempts = 0;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsLocked()
    {
        return LockoutUntil.HasValue && DateTime.UtcNow < LockoutUntil.Value;
    }

    public void SetPasswordMetadata(string algorithm, string? salt = null, int? iterations = null)
    {
        PasswordHashAlgorithm = algorithm;
        PasswordSalt = salt;
        PasswordIterations = iterations;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsSuperAdmin() => Role == UserRole.SuperAdmin;
    public bool IsAdmin() => Role == UserRole.Admin || Role == UserRole.SuperAdmin;
    public bool CanManageUsers() => Role == UserRole.SuperAdmin || Role == UserRole.Admin;
}

