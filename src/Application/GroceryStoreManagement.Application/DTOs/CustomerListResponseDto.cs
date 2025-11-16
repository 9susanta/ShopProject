namespace GroceryStoreManagement.Application.DTOs;

public class CustomerListResponseDto
{
    public List<CustomerDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

