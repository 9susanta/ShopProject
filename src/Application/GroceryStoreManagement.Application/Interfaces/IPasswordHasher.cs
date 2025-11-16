namespace GroceryStoreManagement.Application.Interfaces;

/// <summary>
/// Service interface for password hashing with support for multiple algorithms
/// </summary>
public interface IPasswordHasher
{
    /// <summary>
    /// Hash a password using the preferred algorithm (Argon2id if available, otherwise PBKDF2)
    /// </summary>
    /// <param name="password">Plaintext password</param>
    /// <returns>Hashed password with algorithm metadata</returns>
    PasswordHashResult HashPassword(string password);

    /// <summary>
    /// Verify a password against a hash
    /// </summary>
    /// <param name="password">Plaintext password</param>
    /// <param name="hash">Hashed password</param>
    /// <param name="algorithm">Hash algorithm used</param>
    /// <param name="salt">Salt used (for PBKDF2)</param>
    /// <param name="iterations">Iterations used (for PBKDF2)</param>
    /// <returns>True if password matches, false otherwise</returns>
    bool VerifyPassword(string password, string hash, string? algorithm = null, string? salt = null, int? iterations = null);
}

/// <summary>
/// Result of password hashing operation
/// </summary>
public class PasswordHashResult
{
    public string Hash { get; set; } = string.Empty;
    public string Algorithm { get; set; } = string.Empty;
    public string? Salt { get; set; }
    public int? Iterations { get; set; }
}
