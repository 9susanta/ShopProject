using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetLowStockQuery : IRequest<List<LowStockProductDto>>
{
    public int? Threshold { get; set; } // Optional override threshold
}

public class LowStockProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int AvailableQuantity { get; set; }
    public int LowStockThreshold { get; set; }
    public int Shortage { get; set; } // How many units below threshold
}
