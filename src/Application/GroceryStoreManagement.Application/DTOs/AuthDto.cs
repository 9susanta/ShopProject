using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.DTOs;

// Auth DTOs have been moved to DTOs/Auth/ namespace to avoid conflicts
// This file now only contains user management DTOs

public class CreateUserRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? Phone { get; set; }
}

public class UpdateUserRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public UserRole? Role { get; set; }
    public bool? IsActive { get; set; }
}

public class ChangePasswordRequestDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

