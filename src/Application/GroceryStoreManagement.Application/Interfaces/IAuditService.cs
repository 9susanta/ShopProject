using GroceryStoreManagement.Application.DTOs.Audit;

namespace GroceryStoreManagement.Application.Interfaces;

/// <summary>
/// Service interface for audit logging operations.
/// Captures create, update, and delete operations on entities.
/// </summary>
public interface IAuditService
{
    /// <summary>
    /// Add an audit entry to the log
    /// </summary>
    /// <param name="entry">The audit entry data to add</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task AddAsync(CreateAuditEntryDto entry, CancellationToken cancellationToken = default);

    /// <summary>
    /// Add multiple audit entries in a batch
    /// </summary>
    /// <param name="entries">The audit entries to add</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task AddRangeAsync(IEnumerable<CreateAuditEntryDto> entries, CancellationToken cancellationToken = default);

    /// <summary>
    /// Query audit logs with filters and pagination
    /// </summary>
    /// <param name="request">Query request with filters</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated audit log results</returns>
    Task<AuditLogQueryResult> QueryAsync(AuditLogQueryRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a specific audit entry by ID
    /// </summary>
    /// <param name="id">Audit entry ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Audit entry or null if not found</returns>
    Task<AuditEntryDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Mask sensitive fields in audit data based on configuration
    /// </summary>
    /// <param name="jsonData">JSON string containing entity data</param>
    /// <param name="tableName">Name of the table/entity</param>
    /// <returns>JSON string with sensitive fields masked</returns>
    string MaskSensitiveFields(string? jsonData, string tableName);
}

