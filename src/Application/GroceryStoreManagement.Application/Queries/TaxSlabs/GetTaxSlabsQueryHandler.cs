using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Queries.TaxSlabs;

public class GetTaxSlabsQueryHandler : IRequestHandler<GetTaxSlabsQuery, List<TaxSlabDto>>
{
    private readonly IRepository<TaxSlab> _taxSlabRepository;

    public GetTaxSlabsQueryHandler(IRepository<TaxSlab> taxSlabRepository)
    {
        _taxSlabRepository = taxSlabRepository;
    }

    public async Task<List<TaxSlabDto>> Handle(GetTaxSlabsQuery request, CancellationToken cancellationToken)
    {
        var allTaxSlabs = await _taxSlabRepository.GetAllAsync(cancellationToken);
        var taxSlabs = allTaxSlabs.AsQueryable();

        // Filter by active status
        if (request.IsActive.HasValue)
        {
            taxSlabs = taxSlabs.Where(ts => ts.IsActive == request.IsActive.Value);
        }

        return taxSlabs.Select(ts => new TaxSlabDto
        {
            Id = ts.Id,
            Name = ts.Name,
            Rate = ts.Rate,
            IsDefault = ts.IsDefault,
            IsActive = ts.IsActive,
            CreatedAt = ts.CreatedAt,
            UpdatedAt = ts.UpdatedAt
        }).ToList();
    }
}

