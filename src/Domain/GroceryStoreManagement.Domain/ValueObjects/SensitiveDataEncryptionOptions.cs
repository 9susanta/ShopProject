namespace GroceryStoreManagement.Domain.ValueObjects;

/// <summary>
/// Configuration options for encrypting sensitive data at rest.
/// Used to specify which fields should be encrypted and how.
/// </summary>
public class SensitiveDataEncryptionOptions
{
    /// <summary>
    /// List of property names that should be encrypted
    /// </summary>
    public HashSet<string> EncryptedProperties { get; set; } = new();

    /// <summary>
    /// List of property names that should be masked in audit logs
    /// </summary>
    public HashSet<string> MaskedInAuditProperties { get; set; } = new();

    /// <summary>
    /// Encryption algorithm to use (e.g., "AES-GCM", "AES-CBC")
    /// </summary>
    public string Algorithm { get; set; } = "AES-GCM";

    /// <summary>
    /// Key identifier for key rotation support
    /// </summary>
    public string? KeyId { get; set; }

    /// <summary>
    /// Check if a property should be encrypted
    /// </summary>
    public bool ShouldEncrypt(string propertyName)
    {
        return EncryptedProperties.Contains(propertyName, StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Check if a property should be masked in audit logs
    /// </summary>
    public bool ShouldMaskInAudit(string propertyName)
    {
        return MaskedInAuditProperties.Contains(propertyName, StringComparer.OrdinalIgnoreCase);
    }
}

