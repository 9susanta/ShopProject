namespace GroceryStoreManagement.Application.Interfaces;

/// <summary>
/// Service interface for encrypting/decrypting sensitive data at rest
/// </summary>
public interface IEncryptionService
{
    /// <summary>
    /// Encrypt a plaintext string
    /// </summary>
    /// <param name="plaintext">Plaintext to encrypt</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Encrypted string (base64 encoded)</returns>
    Task<string> EncryptAsync(string plaintext, CancellationToken cancellationToken = default);

    /// <summary>
    /// Decrypt an encrypted string
    /// </summary>
    /// <param name="ciphertext">Encrypted string (base64 encoded)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Decrypted plaintext</returns>
    Task<string> DecryptAsync(string ciphertext, CancellationToken cancellationToken = default);

    /// <summary>
    /// Rotate encryption key (re-encrypt all data with new key)
    /// This is a long-running operation that should be done in a background service
    /// </summary>
    /// <param name="oldKey">Old encryption key</param>
    /// <param name="newKey">New encryption key</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of records re-encrypted</returns>
    Task<int> RotateKeyAsync(string oldKey, string newKey, CancellationToken cancellationToken = default);
}

