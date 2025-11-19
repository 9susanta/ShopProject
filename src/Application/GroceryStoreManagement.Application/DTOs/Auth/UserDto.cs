using GroceryStoreManagement.Domain.Enums;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace GroceryStoreManagement.Application.DTOs.Auth;

/// <summary>
/// DTO for user information returned in authentication responses
/// </summary>
public class UserDto
{
    /// <summary>
    /// User ID (serialized as string for frontend compatibility)
    /// </summary>
    [JsonConverter(typeof(JsonStringGuidConverter))]
    public Guid Id { get; set; }
    
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; }
    
    /// <summary>
    /// Last login timestamp (serialized as ISO 8601 string, or null)
    /// </summary>
    [JsonConverter(typeof(JsonNullableDateTimeConverter))]
    public DateTime? LastLoginAt { get; set; }
    
    /// <summary>
    /// Number of failed login attempts
    /// </summary>
    public int FailedLoginAttempts { get; set; }
    
    /// <summary>
    /// Lockout expiration timestamp (serialized as ISO 8601 string, or null)
    /// </summary>
    [JsonConverter(typeof(JsonNullableDateTimeConverter))]
    public DateTime? LockoutUntil { get; set; }
    
    /// <summary>
    /// Whether the account is currently locked
    /// </summary>
    public bool IsLocked { get; set; }
}

/// <summary>
/// JSON converter for Guid to string
/// </summary>
public class JsonStringGuidConverter : JsonConverter<Guid>
{
    public override Guid Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var stringValue = reader.GetString();
            if (Guid.TryParse(stringValue, out var guid))
            {
                return guid;
            }
        }
        return Guid.Empty;
    }

    public override void Write(Utf8JsonWriter writer, Guid value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString());
    }
}

/// <summary>
/// JSON converter for nullable DateTime to ISO 8601 string
/// </summary>
public class JsonNullableDateTimeConverter : JsonConverter<DateTime?>
{
    public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return null;
        }
        
        if (reader.TokenType == JsonTokenType.String)
        {
            var stringValue = reader.GetString();
            if (string.IsNullOrEmpty(stringValue))
            {
                return null;
            }
            if (DateTime.TryParse(stringValue, out var dateTime))
            {
                return dateTime;
            }
        }
        return null;
    }

    public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
        {
            writer.WriteStringValue(value.Value.ToString("O")); // ISO 8601 format
        }
        else
        {
            writer.WriteNullValue();
        }
    }
}

