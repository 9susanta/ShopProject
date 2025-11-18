using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.DTOs;

public class SaleReturnDto
{
    public Guid Id { get; set; }
    public string ReturnNumber { get; set; } = string.Empty;
    public Guid SaleId { get; set; }
    public string SaleInvoiceNumber { get; set; } = string.Empty;
    public DateTime ReturnDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public ReturnStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public decimal TotalRefundAmount { get; set; }
    public string? Notes { get; set; }
    public Guid? ProcessedByUserId { get; set; }
    public string? ProcessedByUserName { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<SaleReturnItemDto> Items { get; set; } = new();
    public RefundDto? Refund { get; set; }
}

public class SaleReturnItemDto
{
    public Guid Id { get; set; }
    public Guid SaleItemId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalRefundAmount { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class RefundDto
{
    public Guid Id { get; set; }
    public Guid SaleReturnId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string PaymentMethodName => PaymentMethod.ToString();
    public RefundStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public string? TransactionId { get; set; }
    public string? ReferenceNumber { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public Guid? ProcessedByUserId { get; set; }
    public string? ProcessedByUserName { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}


