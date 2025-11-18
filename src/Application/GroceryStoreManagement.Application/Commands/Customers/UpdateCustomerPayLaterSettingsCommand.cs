using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Customers;

public class UpdateCustomerPayLaterSettingsCommand : IRequest<CustomerDto>
{
    public Guid CustomerId { get; set; }
    public bool IsPayLaterEnabled { get; set; }
    public decimal? PayLaterLimit { get; set; }
}

