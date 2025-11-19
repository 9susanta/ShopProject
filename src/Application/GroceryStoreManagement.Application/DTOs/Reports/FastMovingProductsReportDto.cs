namespace GroceryStoreManagement.Application.DTOs;

public class FastMovingProductsReportDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<FastMovingProductDto> Products { get; set; } = new();
}

