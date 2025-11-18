using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Customers;

public class GetCustomerSavedItemsQuery : IRequest<CustomerSavedItemListResponseDto>
{
    public Guid CustomerId { get; set; }
    public bool? IsFavorite { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

