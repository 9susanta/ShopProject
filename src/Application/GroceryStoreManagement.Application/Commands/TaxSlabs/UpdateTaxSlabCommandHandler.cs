using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.TaxSlabs;

public class UpdateTaxSlabCommandHandler : IRequestHandler<UpdateTaxSlabCommand, TaxSlabDto>
{
    private readonly IRepository<TaxSlab> _taxSlabRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateTaxSlabCommandHandler> _logger;

    public UpdateTaxSlabCommandHandler(
        IRepository<TaxSlab> taxSlabRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateTaxSlabCommandHandler> logger)
    {
        _taxSlabRepository = taxSlabRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<TaxSlabDto> Handle(UpdateTaxSlabCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating tax slab: {TaxSlabId}", request.Id);

        var taxSlab = await _taxSlabRepository.GetByIdAsync(request.Id, cancellationToken);
        if (taxSlab == null)
            throw new InvalidOperationException($"TaxSlab with id {request.Id} not found");

        // If setting as default, remove default from all other tax slabs
        if (request.IsDefault && !taxSlab.IsDefault)
        {
            var allTaxSlabs = await _taxSlabRepository.GetAllAsync(cancellationToken);
            var defaultTaxSlabs = allTaxSlabs.Where(ts => ts.Id != request.Id && ts.IsDefault).ToList();
            foreach (var ts in defaultTaxSlabs)
            {
                ts.RemoveDefault();
                await _taxSlabRepository.UpdateAsync(ts, cancellationToken);
            }
        }

        taxSlab.Update(request.Name, request.Rate);
        
        if (request.IsDefault && !taxSlab.IsDefault)
            taxSlab.SetAsDefault();
        else if (!request.IsDefault && taxSlab.IsDefault)
            taxSlab.RemoveDefault();

        await _taxSlabRepository.UpdateAsync(taxSlab, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Tax slab updated successfully: {TaxSlabId}", taxSlab.Id);

        return new TaxSlabDto
        {
            Id = taxSlab.Id,
            Name = taxSlab.Name,
            Rate = taxSlab.Rate,
            IsDefault = taxSlab.IsDefault,
            IsActive = taxSlab.IsActive,
            CreatedAt = taxSlab.CreatedAt,
            UpdatedAt = taxSlab.UpdatedAt
        };
    }
}

