namespace GroceryStoreManagement.Application.DTOs;

public class InventoryAdjustmentDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int QuantityChange { get; set; }
    public int QuantityBefore { get; set; }
    public int QuantityAfter { get; set; }
    public string AdjustmentType { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string AdjustedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

