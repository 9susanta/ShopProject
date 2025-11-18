using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Suppliers;

public class GetSuppliersQuery : IRequest<SupplierListResponseDto>
{
    public bool? IsActive { get; set; } // null = all, true = active only, false = inactive only
    public string? Search { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 100; // Default to 100 for master data
}

