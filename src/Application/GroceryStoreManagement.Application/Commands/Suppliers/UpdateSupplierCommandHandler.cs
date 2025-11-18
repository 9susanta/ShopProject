using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Suppliers;

public class UpdateSupplierCommandHandler : IRequestHandler<UpdateSupplierCommand, SupplierDto>
{
    private readonly IRepository<Supplier> _supplierRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateSupplierCommandHandler> _logger;

    public UpdateSupplierCommandHandler(
        IRepository<Supplier> supplierRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateSupplierCommandHandler> logger)
    {
        _supplierRepository = supplierRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<SupplierDto> Handle(UpdateSupplierCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating supplier: {SupplierId}", request.Id);

        var supplier = await _supplierRepository.GetByIdAsync(request.Id, cancellationToken);
        if (supplier == null)
            throw new KeyNotFoundException($"Supplier with ID {request.Id} not found.");

        supplier.Update(
            request.Name,
            request.ContactPerson,
            request.Email,
            request.Phone,
            request.Address);

        // Handle active status
        if (request.IsActive && !supplier.IsActive)
        {
            supplier.Activate();
        }
        else if (!request.IsActive && supplier.IsActive)
        {
            supplier.Deactivate();
        }

        await _supplierRepository.UpdateAsync(supplier, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Supplier updated successfully: {SupplierId}", supplier.Id);

        return new SupplierDto
        {
            Id = supplier.Id,
            Name = supplier.Name,
            ContactPerson = supplier.ContactPerson,
            Email = supplier.Email,
            Phone = supplier.Phone,
            Address = supplier.Address,
            GstNumber = null, // Supplier entity doesn't have GST number yet
            IsActive = supplier.IsActive,
            CreatedAt = supplier.CreatedAt,
            UpdatedAt = supplier.UpdatedAt
        };
    }
}

