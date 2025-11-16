using System.Security.Cryptography;
using System.Text;
using GroceryStoreManagement.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace GroceryStoreManagement.Infrastructure.Services;

/// <summary>
/// AES-GCM encryption service for encrypting sensitive data at rest
/// Falls back to AES-CBC with HMAC if GCM is not available
/// </summary>
public class EncryptionService : IEncryptionService
{
    private readonly IConfiguration _configuration;
    private readonly byte[] _encryptionKey;
    private const int KEY_SIZE = 32; // 256 bits for AES-256
    private const int IV_SIZE = 12; // 96 bits for GCM, 16 for CBC
    private const int TAG_SIZE = 16; // 128 bits for GCM authentication tag

    public EncryptionService(IConfiguration configuration)
    {
        _configuration = configuration;
        var keyBase64 = configuration["Encryption:Key"] 
            ?? throw new InvalidOperationException("Encryption key is not configured. Set Encryption:Key in appsettings.json or environment variable.");

        try
        {
            _encryptionKey = Convert.FromBase64String(keyBase64);
            if (_encryptionKey.Length != KEY_SIZE)
            {
                throw new InvalidOperationException($"Encryption key must be {KEY_SIZE * 8} bits (base64 encoded). Current length: {_encryptionKey.Length * 8} bits.");
            }
        }
        catch (FormatException)
        {
            throw new InvalidOperationException("Encryption key must be a valid base64 string.");
        }
    }

    public async Task<string> EncryptAsync(string plaintext, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(plaintext))
            return string.Empty;

        return await Task.Run(() =>
        {
            try
            {
                // Try AES-GCM first (more secure)
                return EncryptWithAesGcm(plaintext);
            }
            catch
            {
                // Fallback to AES-CBC with HMAC
                return EncryptWithAesCbc(plaintext);
            }
        }, cancellationToken);
    }

    public async Task<string> DecryptAsync(string ciphertext, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(ciphertext))
            return string.Empty;

        return await Task.Run(() =>
        {
            try
            {
                // Detect algorithm from ciphertext format
                if (ciphertext.StartsWith("AES-GCM:", StringComparison.Ordinal))
                {
                    return DecryptWithAesGcm(ciphertext.Substring(8));
                }
                else if (ciphertext.StartsWith("AES-CBC:", StringComparison.Ordinal))
                {
                    return DecryptWithAesCbc(ciphertext.Substring(8));
                }
                else
                {
                    // Legacy format - try GCM first, then CBC
                    try
                    {
                        return DecryptWithAesGcm(ciphertext);
                    }
                    catch
                    {
                        return DecryptWithAesCbc(ciphertext);
                    }
                }
            }
            catch
            {
                throw new CryptographicException("Failed to decrypt data. The data may be corrupted or encrypted with a different key.");
            }
        }, cancellationToken);
    }

    public async Task<int> RotateKeyAsync(string oldKey, string newKey, CancellationToken cancellationToken = default)
    {
        // Key rotation is a complex operation that should be implemented
        // as a background service that:
        // 1. Reads all encrypted columns from the database
        // 2. Decrypts with old key
        // 3. Re-encrypts with new key
        // 4. Updates records in batches
        // 5. Updates configuration with new key
        
        // This is a stub - implement in a background service
        await Task.CompletedTask;
        throw new NotImplementedException("Key rotation should be implemented as a background service. See README for key rotation instructions.");
    }

    private string EncryptWithAesGcm(string plaintext)
    {
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var iv = new byte[IV_SIZE];
        RandomNumberGenerator.Fill(iv);

        var ciphertext = new byte[plaintextBytes.Length];
        var tag = new byte[TAG_SIZE];

        using var aes = new AesGcm(_encryptionKey, TAG_SIZE);
        aes.Encrypt(iv, plaintextBytes, ciphertext, tag);

        // Format: IV (base64) + ":" + Tag (base64) + ":" + Ciphertext (base64)
        var result = $"AES-GCM:{Convert.ToBase64String(iv)}:{Convert.ToBase64String(tag)}:{Convert.ToBase64String(ciphertext)}";
        return result;
    }

    private string DecryptWithAesGcm(string ciphertext)
    {
        var parts = ciphertext.Split(':');
        if (parts.Length != 3)
            throw new CryptographicException("Invalid AES-GCM ciphertext format");

        var iv = Convert.FromBase64String(parts[0]);
        var tag = Convert.FromBase64String(parts[1]);
        var encryptedBytes = Convert.FromBase64String(parts[2]);

        var plaintext = new byte[encryptedBytes.Length];

        using var aes = new AesGcm(_encryptionKey, TAG_SIZE);
        aes.Decrypt(iv, encryptedBytes, tag, plaintext);

        return Encoding.UTF8.GetString(plaintext);
    }

    private string EncryptWithAesCbc(string plaintext)
    {
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var iv = new byte[16]; // 128 bits for CBC
        RandomNumberGenerator.Fill(iv);

        using var aes = Aes.Create();
        aes.Key = _encryptionKey;
        aes.IV = iv;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;

        using var encryptor = aes.CreateEncryptor();
        var ciphertext = encryptor.TransformFinalBlock(plaintextBytes, 0, plaintextBytes.Length);

        // Compute HMAC for authentication
        using var hmac = new HMACSHA256(_encryptionKey);
        var hmacBytes = hmac.ComputeHash(ConcatArrays(iv, ciphertext));

        // Format: IV (base64) + ":" + HMAC (base64) + ":" + Ciphertext (base64)
        var result = $"AES-CBC:{Convert.ToBase64String(iv)}:{Convert.ToBase64String(hmacBytes)}:{Convert.ToBase64String(ciphertext)}";
        return result;
    }

    private string DecryptWithAesCbc(string ciphertext)
    {
        var parts = ciphertext.Split(':');
        if (parts.Length != 3)
            throw new CryptographicException("Invalid AES-CBC ciphertext format");

        var iv = Convert.FromBase64String(parts[0]);
        var expectedHmac = Convert.FromBase64String(parts[1]);
        var encryptedBytes = Convert.FromBase64String(parts[2]);

        // Verify HMAC
        using var hmac = new HMACSHA256(_encryptionKey);
        var computedHmac = hmac.ComputeHash(ConcatArrays(iv, encryptedBytes));

        if (!CryptographicOperations.FixedTimeEquals(expectedHmac, computedHmac))
        {
            throw new CryptographicException("HMAC verification failed. Data may be tampered.");
        }

        using var aes = Aes.Create();
        aes.Key = _encryptionKey;
        aes.IV = iv;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;

        using var decryptor = aes.CreateDecryptor();
        var plaintext = decryptor.TransformFinalBlock(encryptedBytes, 0, encryptedBytes.Length);

        return Encoding.UTF8.GetString(plaintext);
    }

    private static byte[] ConcatArrays(byte[] first, byte[] second)
    {
        var result = new byte[first.Length + second.Length];
        Buffer.BlockCopy(first, 0, result, 0, first.Length);
        Buffer.BlockCopy(second, 0, result, first.Length, second.Length);
        return result;
    }
}

