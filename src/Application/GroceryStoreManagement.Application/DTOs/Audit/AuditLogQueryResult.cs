namespace GroceryStoreManagement.Application.DTOs.Audit;

/// <summary>
/// Result DTO for audit log queries with pagination metadata
/// </summary>
public class AuditLogQueryResult
{
    /// <summary>
    /// List of audit entries
    /// </summary>
    public List<AuditEntryDto> Items { get; set; } = new();

    /// <summary>
    /// Total number of records matching the query
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Current page number
    /// </summary>
    public int Page { get; set; }

    /// <summary>
    /// Page size
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Total number of pages
    /// </summary>
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);

    /// <summary>
    /// Whether there is a next page
    /// </summary>
    public bool HasNextPage => Page < TotalPages;

    /// <summary>
    /// Whether there is a previous page
    /// </summary>
    public bool HasPreviousPage => Page > 1;
}

