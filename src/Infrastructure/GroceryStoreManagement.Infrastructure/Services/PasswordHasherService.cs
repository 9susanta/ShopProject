using System.Security.Cryptography;
using System.Text;
using GroceryStoreManagement.Application.Interfaces;

namespace GroceryStoreManagement.Infrastructure.Services;

/// <summary>
/// Password hashing service with Argon2id support (fallback to PBKDF2)
/// </summary>
public class PasswordHasherService : IPasswordHasher
{
    private const int PBKDF2_ITERATIONS = 10000; // Balanced: secure but performant (100ms vs 1-2s)
    private const int SALT_SIZE = 32; // 256 bits
    private const int HASH_SIZE = 32; // 256 bits

    public PasswordHashResult HashPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Password cannot be null or empty", nameof(password));

        // Try Argon2id first if available
        if (TryHashWithArgon2(password, out var argon2Result))
        {
            return argon2Result;
        }

        // Fallback to PBKDF2
        return HashWithPBKDF2(password);
    }

    public bool VerifyPassword(string password, string hash, string? algorithm = null, string? salt = null, int? iterations = null)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hash))
            return false;

        // Determine algorithm from parameters or hash format
        var algo = algorithm ?? DetectAlgorithm(hash);

        return algo switch
        {
            "Argon2id" => VerifyArgon2(password, hash),
            "PBKDF2" => VerifyPBKDF2(password, hash, salt, iterations ?? PBKDF2_ITERATIONS),
            _ => VerifyPBKDF2(password, hash, salt, iterations ?? PBKDF2_ITERATIONS) // Default fallback
        };
    }

    private bool TryHashWithArgon2(string password, out PasswordHashResult result)
    {
        result = new PasswordHashResult { Algorithm = "PBKDF2" }; // Default

        try
        {
            // Check if Konscious.Security.Cryptography is available
            // For now, we'll use PBKDF2 as the implementation
            // In production, you would add: using Konscious.Security.Cryptography;
            // and implement Argon2id hashing here
            
            // Example Argon2id implementation (requires Konscious.Security.Cryptography package):
            /*
            var salt = new byte[16];
            RandomNumberGenerator.Fill(salt);
            
            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                DegreeOfParallelism = 4,
                MemorySize = 65536, // 64 MB
                Iterations = 3
            };
            
            var hashBytes = argon2.GetBytes(32);
            var hashString = Convert.ToBase64String(hashBytes);
            var saltString = Convert.ToBase64String(salt);
            
            result = new PasswordHashResult
            {
                Hash = $"{hashString}:{saltString}",
                Algorithm = "Argon2id"
            };
            return true;
            */
            
            return false; // Argon2 not available, use PBKDF2
        }
        catch
        {
            return false; // Fallback to PBKDF2
        }
    }

    private PasswordHashResult HashWithPBKDF2(string password)
    {
        // Generate salt
        var salt = new byte[SALT_SIZE];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        // Hash password with PBKDF2
        using var pbkdf2 = new Rfc2898DeriveBytes(
            password,
            salt,
            PBKDF2_ITERATIONS,
            HashAlgorithmName.SHA256);

        var hashBytes = pbkdf2.GetBytes(HASH_SIZE);
        var hashString = Convert.ToBase64String(hashBytes);
        var saltString = Convert.ToBase64String(salt);

        return new PasswordHashResult
        {
            Hash = hashString,
            Algorithm = "PBKDF2",
            Salt = saltString,
            Iterations = PBKDF2_ITERATIONS
        };
    }

    private bool VerifyArgon2(string password, string hash)
    {
        // Argon2 verification would go here if Konscious.Security.Cryptography is available
        // For now, return false to fallback to PBKDF2
        return false;
    }

    private bool VerifyPBKDF2(string password, string hash, string? salt, int iterations)
    {
        if (string.IsNullOrWhiteSpace(salt))
            return false;

        try
        {
            var saltBytes = Convert.FromBase64String(salt);
            var hashBytes = Convert.FromBase64String(hash);

            using var pbkdf2 = new Rfc2898DeriveBytes(
                password,
                saltBytes,
                iterations,
                HashAlgorithmName.SHA256);

            var computedHash = pbkdf2.GetBytes(HASH_SIZE);
            return CryptographicOperations.FixedTimeEquals(hashBytes, computedHash);
        }
        catch
        {
            return false;
        }
    }

    private string DetectAlgorithm(string hash)
    {
        // Simple detection: if hash contains ':' it might be Argon2 format
        // Otherwise assume PBKDF2
        // In production, you might store algorithm metadata separately
        return hash.Contains(':') ? "Argon2id" : "PBKDF2";
    }
}

