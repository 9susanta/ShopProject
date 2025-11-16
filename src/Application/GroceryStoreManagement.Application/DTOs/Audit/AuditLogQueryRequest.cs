namespace GroceryStoreManagement.Application.DTOs.Audit;

/// <summary>
/// Request DTO for querying audit logs with filters and pagination
/// </summary>
public class AuditLogQueryRequest
{
    /// <summary>
    /// Filter by table name
    /// </summary>
    public string? TableName { get; set; }

    /// <summary>
    /// Filter by operation type (Create, Update, Delete)
    /// </summary>
    public string? Operation { get; set; }

    /// <summary>
    /// Filter by user ID
    /// </summary>
    public Guid? UserId { get; set; }

    /// <summary>
    /// Filter by correlation ID
    /// </summary>
    public string? CorrelationId { get; set; }

    /// <summary>
    /// Filter by start date (UTC)
    /// </summary>
    public DateTime? FromDate { get; set; }

    /// <summary>
    /// Filter by end date (UTC)
    /// </summary>
    public DateTime? ToDate { get; set; }

    /// <summary>
    /// Page number (1-based)
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Page size
    /// </summary>
    public int PageSize { get; set; } = 50;

    /// <summary>
    /// Sort field (default: TimestampUtc)
    /// </summary>
    public string SortBy { get; set; } = "TimestampUtc";

    /// <summary>
    /// Sort direction (asc or desc)
    /// </summary>
    public string SortDirection { get; set; } = "desc";
}

