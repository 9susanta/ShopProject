using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Suppliers;

public class GetSuppliersQueryHandler : IRequestHandler<GetSuppliersQuery, SupplierListResponseDto>
{
    private readonly IRepository<Supplier> _supplierRepository;
    private readonly ILogger<GetSuppliersQueryHandler> _logger;

    public GetSuppliersQueryHandler(
        IRepository<Supplier> supplierRepository,
        ILogger<GetSuppliersQueryHandler> logger)
    {
        _supplierRepository = supplierRepository;
        _logger = logger;
    }

    public async Task<SupplierListResponseDto> Handle(GetSuppliersQuery request, CancellationToken cancellationToken)
    {
        var allSuppliers = await _supplierRepository.GetAllAsync(cancellationToken);
        var suppliers = allSuppliers.AsQueryable();

        // Filter by search term
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.ToLower();
            suppliers = suppliers.Where(s =>
                s.Name.ToLower().Contains(searchTerm) ||
                (s.ContactPerson != null && s.ContactPerson.ToLower().Contains(searchTerm)) ||
                (s.Email != null && s.Email.ToLower().Contains(searchTerm)) ||
                (s.Phone != null && s.Phone.Contains(searchTerm)));
        }

        // Filter by active status
        if (request.IsActive.HasValue)
        {
            suppliers = suppliers.Where(s => s.IsActive == request.IsActive.Value);
        }

        // Get total count before pagination
        var totalCount = suppliers.Count();

        // Apply pagination
        var pagedSuppliers = suppliers
            .OrderBy(s => s.Name)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var supplierDtos = pagedSuppliers.Select(s => new SupplierDto
        {
            Id = s.Id,
            Name = s.Name,
            ContactPerson = s.ContactPerson,
            Email = s.Email,
            Phone = s.Phone,
            Address = s.Address,
            GstNumber = null, // Supplier entity doesn't have GST number yet
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt
        }).ToList();

        return new SupplierListResponseDto
        {
            Items = supplierDtos,
            TotalCount = totalCount
        };
    }
}

