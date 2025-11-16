namespace GroceryStoreManagement.Application.DTOs;

/// <summary>
/// Response DTO for paginated product list
/// </summary>
public class ProductListResponseDto
{
    /// <summary>
    /// List of products
    /// </summary>
    public List<ProductDto> Items { get; set; } = new();

    /// <summary>
    /// Total number of records matching the query
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Current page number
    /// </summary>
    public int PageNumber { get; set; }

    /// <summary>
    /// Page size
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Total number of pages
    /// </summary>
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling(TotalCount / (double)PageSize) : 0;
}

