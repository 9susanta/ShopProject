using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.DTOs.Auth;

/// <summary>
/// DTO for user information returned in authentication responses
/// </summary>
public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

