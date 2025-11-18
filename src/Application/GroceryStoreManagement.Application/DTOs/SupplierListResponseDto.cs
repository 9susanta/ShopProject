namespace GroceryStoreManagement.Application.DTOs;

public class SupplierListResponseDto
{
    public List<SupplierDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
}

