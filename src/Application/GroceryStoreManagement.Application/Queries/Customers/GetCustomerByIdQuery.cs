using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Customers;

public class GetCustomerByIdQuery : IRequest<CustomerDto?>
{
    public Guid Id { get; set; }
}

