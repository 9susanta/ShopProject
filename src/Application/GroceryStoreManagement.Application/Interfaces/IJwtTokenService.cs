using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    bool ValidateToken(string token);
    string? GetUserIdFromToken(string token);
    string? GetUserRoleFromToken(string token);
}

