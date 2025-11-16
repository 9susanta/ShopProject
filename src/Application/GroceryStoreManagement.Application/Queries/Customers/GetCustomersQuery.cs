using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Customers;

public class GetCustomersQuery : IRequest<CustomerListResponseDto>
{
    public string? Search { get; set; }
    public bool? IsActive { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

