using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Customers;

public class GetCustomerByPhoneQuery : IRequest<CustomerDto?>
{
    public string Phone { get; set; } = string.Empty;
}

