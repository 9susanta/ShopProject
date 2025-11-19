namespace GroceryStoreManagement.Application.DTOs;

public class SaleListResponseDto
{
    public List<SaleDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

