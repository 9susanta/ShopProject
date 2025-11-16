using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.TaxSlabs;

public class CreateTaxSlabCommand : IRequest<TaxSlabDto>
{
    public string Name { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public bool IsDefault { get; set; } = false;
}

