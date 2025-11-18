using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Suppliers;

public class GetSupplierPaymentsQuery : IRequest<List<SupplierPaymentDto>>
{
    public Guid SupplierId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

