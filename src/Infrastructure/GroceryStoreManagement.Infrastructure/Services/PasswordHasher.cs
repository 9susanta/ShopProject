using System.Security.Cryptography;
using System.Text;
using GroceryStoreManagement.Application.Interfaces;

namespace GroceryStoreManagement.Infrastructure.Services;

/// <summary>
/// Legacy password hasher (SHA256) - kept for backward compatibility
/// Consider migrating to PasswordHasherService for better security
/// </summary>
public class PasswordHasher : IPasswordHasher
{
    public PasswordHashResult HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return new PasswordHashResult
        {
            Hash = Convert.ToBase64String(hashedBytes),
            Algorithm = "SHA256"
        };
    }

    public bool VerifyPassword(string password, string hash, string? algorithm = null, string? salt = null, int? iterations = null)
    {
        var result = HashPassword(password);
        return result.Hash == hash;
    }
}

