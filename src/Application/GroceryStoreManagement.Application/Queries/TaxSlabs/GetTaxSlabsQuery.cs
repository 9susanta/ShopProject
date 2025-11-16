using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.TaxSlabs;

public class GetTaxSlabsQuery : IRequest<List<TaxSlabDto>>
{
    public bool? IsActive { get; set; } = true; // Default to active only
}

