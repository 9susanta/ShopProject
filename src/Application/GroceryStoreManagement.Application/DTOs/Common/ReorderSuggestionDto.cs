namespace GroceryStoreManagement.Application.DTOs;

public class ReorderSuggestionDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int ReorderPoint { get; set; }
    public int SuggestedQuantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal EstimatedCost { get; set; }
}

