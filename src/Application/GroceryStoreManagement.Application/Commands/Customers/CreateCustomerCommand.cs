using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Customers;

public class CreateCustomerCommand : IRequest<CustomerDto>
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Pincode { get; set; }
}

