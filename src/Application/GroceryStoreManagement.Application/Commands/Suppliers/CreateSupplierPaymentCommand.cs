using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Commands.Suppliers;

public class CreateSupplierPaymentCommand : IRequest<SupplierPaymentDto>
{
    public Guid SupplierId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public DateTime PaymentDate { get; set; }
    public Guid? PurchaseOrderId { get; set; }
    public Guid? GRNId { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
}

