using System.ComponentModel.DataAnnotations;

namespace GroceryStoreManagement.Application.DTOs.Auth;

/// <summary>
/// Request DTO for refreshing access token
/// </summary>
public class RefreshTokenRequestDto
{
    /// <summary>
    /// Refresh token received during login
    /// </summary>
    [Required(ErrorMessage = "Refresh token is required")]
    public string RefreshToken { get; set; } = string.Empty;
}

