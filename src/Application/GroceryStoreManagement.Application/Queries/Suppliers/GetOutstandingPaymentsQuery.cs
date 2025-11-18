using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Suppliers;

public class GetOutstandingPaymentsQuery : IRequest<List<OutstandingPaymentDto>>
{
    public Guid? SupplierId { get; set; }
}

