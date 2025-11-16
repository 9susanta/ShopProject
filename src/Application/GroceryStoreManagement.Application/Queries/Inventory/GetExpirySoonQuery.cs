using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetExpirySoonQuery : IRequest<List<ExpirySoonBatchDto>>
{
    public int DaysThreshold { get; set; } = 7; // Default 7 days
}

public class ExpirySoonBatchDto
{
    public Guid BatchId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int AvailableQuantity { get; set; }
    public DateTime ExpiryDate { get; set; }
    public int DaysUntilExpiry { get; set; }
    public string? BatchNumber { get; set; }
}
