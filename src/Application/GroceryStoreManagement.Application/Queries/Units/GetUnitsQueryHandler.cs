using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using UnitEntity = GroceryStoreManagement.Domain.Entities.Unit;

namespace GroceryStoreManagement.Application.Queries.Units;

public class GetUnitsQueryHandler : IRequestHandler<GetUnitsQuery, List<UnitDto>>
{
    private readonly IRepository<UnitEntity> _unitRepository;

    public GetUnitsQueryHandler(IRepository<UnitEntity> unitRepository)
    {
        _unitRepository = unitRepository;
    }

    public async Task<List<UnitDto>> Handle(GetUnitsQuery request, CancellationToken cancellationToken)
    {
        var allUnits = await _unitRepository.GetAllAsync(cancellationToken);
        var units = allUnits.AsQueryable();

        // Filter by active status
        if (request.IsActive.HasValue)
        {
            units = units.Where(u => u.IsActive == request.IsActive.Value);
        }

        return units
            .OrderBy(u => u.SortOrder)
            .ThenBy(u => u.Name)
            .Select(u => new UnitDto
            {
                Id = u.Id,
                Name = u.Name,
                Symbol = u.Symbol,
                Type = u.Type,
                SortOrder = u.SortOrder,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            }).ToList();
    }
}

