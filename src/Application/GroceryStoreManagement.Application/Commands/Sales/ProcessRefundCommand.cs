using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Commands.Sales;

public class ProcessRefundCommand : IRequest<RefundDto>
{
    public Guid SaleReturnId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
}


