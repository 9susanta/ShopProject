using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Purchases;

public class CreateGRNCommand : IRequest<GRNDto>
{
    public string GRNNumber { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public Guid? PurchaseOrderId { get; set; }
    public DateTime ReceivedDate { get; set; } = DateTime.UtcNow;
    public string? InvoiceNumber { get; set; }
    public string? InvoiceFilePath { get; set; }
    public string? Notes { get; set; }
    public string? IdempotencyKey { get; set; }
    public List<GRNItemRequest> Items { get; set; } = new();
}

public class GRNItemRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? BatchNumber { get; set; }
}

