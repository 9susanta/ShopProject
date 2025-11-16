using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Inventory;

public class AdjustInventoryCommand : IRequest<InventoryAdjustmentDto>
{
    public Guid ProductId { get; set; }
    public int QuantityChange { get; set; } // Positive for increase, negative for decrease
    public string AdjustmentType { get; set; } = string.Empty; // Manual, Damage, Return, Expiry
    public string? Reason { get; set; }
    public string? ReferenceNumber { get; set; }
    public string AdjustedBy { get; set; } = string.Empty; // User making the adjustment
}

