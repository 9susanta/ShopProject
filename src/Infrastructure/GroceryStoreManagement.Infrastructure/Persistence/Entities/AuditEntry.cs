using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GroceryStoreManagement.Infrastructure.Persistence.Entities;

/// <summary>
/// Represents an audit log entry for tracking create, update, and delete operations
/// on entities within the system. Stores change history with user context and request metadata.
/// </summary>
[Table("AuditEntries")]
[Index(nameof(TableName))]
[Index(nameof(UserId))]
[Index(nameof(CorrelationId))]
[Index(nameof(TimestampUtc))]
[Index(nameof(Operation))]
public class AuditEntry
{
    /// <summary>
    /// Unique identifier for the audit entry
    /// </summary>
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Name of the database table/entity that was modified
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string TableName { get; set; } = string.Empty;

    /// <summary>
    /// JSON representation of the primary key values for the affected entity
    /// Example: {"Id": "123e4567-e89b-12d3-a456-426614174000"}
    /// </summary>
    [Column(TypeName = "nvarchar(max)")]
    public string? KeyValues { get; set; }

    /// <summary>
    /// JSON representation of the entity state before the operation (for Update/Delete)
    /// Null for Create operations
    /// </summary>
    [Column(TypeName = "nvarchar(max)")]
    public string? OldValues { get; set; }

    /// <summary>
    /// JSON representation of the entity state after the operation (for Create/Update)
    /// Null for Delete operations
    /// </summary>
    [Column(TypeName = "nvarchar(max)")]
    public string? NewValues { get; set; }

    /// <summary>
    /// Type of operation performed: Create, Update, or Delete
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string Operation { get; set; } = string.Empty;

    /// <summary>
    /// ID of the user who performed the operation (nullable for system operations)
    /// </summary>
    public Guid? UserId { get; set; }

    /// <summary>
    /// Username or email of the user who performed the operation
    /// </summary>
    [MaxLength(200)]
    public string? UserName { get; set; }

    /// <summary>
    /// Correlation ID for tracking the request across services/logs
    /// </summary>
    [MaxLength(100)]
    public string? CorrelationId { get; set; }

    /// <summary>
    /// HTTP request path that triggered the operation
    /// </summary>
    [MaxLength(500)]
    public string? RequestPath { get; set; }

    /// <summary>
    /// IP address of the client that made the request
    /// </summary>
    [MaxLength(50)]
    public string? ClientIp { get; set; }

    /// <summary>
    /// UTC timestamp when the operation occurred
    /// </summary>
    [Required]
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Optional additional metadata as JSON (e.g., device info, user agent)
    /// </summary>
    [Column(TypeName = "nvarchar(max)")]
    public string? Metadata { get; set; }
}

/// <summary>
/// Enumeration of audit operation types
/// </summary>
public enum AuditOperation
{
    /// <summary>
    /// Entity was created
    /// </summary>
    Create = 0,

    /// <summary>
    /// Entity was updated
    /// </summary>
    Update = 1,

    /// <summary>
    /// Entity was deleted
    /// </summary>
    Delete = 2
}

