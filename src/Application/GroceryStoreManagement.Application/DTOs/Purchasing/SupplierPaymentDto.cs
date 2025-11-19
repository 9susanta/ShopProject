using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.DTOs;

public class SupplierPaymentDto
{
    public Guid Id { get; set; }
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public Guid? PurchaseOrderId { get; set; }
    public string? PurchaseOrderNumber { get; set; }
    public Guid? GRNId { get; set; }
    public string? GRNNumber { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class OutstandingPaymentDto
{
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public decimal TotalOutstanding { get; set; }
    public int UnpaidOrders { get; set; }
    public int UnpaidGRNs { get; set; }
    public DateTime? LastPaymentDate { get; set; }
}

