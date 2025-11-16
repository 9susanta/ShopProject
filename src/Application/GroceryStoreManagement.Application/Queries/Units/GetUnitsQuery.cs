using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Units;

public class GetUnitsQuery : IRequest<List<UnitDto>>
{
    public bool? IsActive { get; set; } = true; // Default to active only
}

