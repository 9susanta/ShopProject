using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Customers;

public class AddCustomerSavedItemCommand : IRequest<CustomerSavedItemDto>
{
    public Guid CustomerId { get; set; }
    public Guid ProductId { get; set; }
    public bool IsFavorite { get; set; } = false;
}

