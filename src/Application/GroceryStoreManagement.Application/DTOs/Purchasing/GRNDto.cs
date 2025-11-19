namespace GroceryStoreManagement.Application.DTOs;

public class GRNDto
{
    public Guid Id { get; set; }
    public string GRNNumber { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public Guid? PurchaseOrderId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime ReceivedDate { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? InvoiceFilePath { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public string? IdempotencyKey { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<GRNItemDto> Items { get; set; } = new();
}

public class GRNItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? BatchNumber { get; set; }
}

