using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.TaxSlabs;

public class CreateTaxSlabCommandHandler : IRequestHandler<CreateTaxSlabCommand, TaxSlabDto>
{
    private readonly IRepository<TaxSlab> _taxSlabRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateTaxSlabCommandHandler> _logger;

    public CreateTaxSlabCommandHandler(
        IRepository<TaxSlab> taxSlabRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateTaxSlabCommandHandler> logger)
    {
        _taxSlabRepository = taxSlabRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<TaxSlabDto> Handle(CreateTaxSlabCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating tax slab: {TaxSlabName}", request.Name);

        // If setting as default, remove default from all other tax slabs
        if (request.IsDefault)
        {
            var allTaxSlabs = await _taxSlabRepository.GetAllAsync(cancellationToken);
            var defaultTaxSlabs = allTaxSlabs.Where(ts => ts.IsDefault).ToList();
            foreach (var ts in defaultTaxSlabs)
            {
                ts.RemoveDefault();
                await _taxSlabRepository.UpdateAsync(ts, cancellationToken);
            }
        }

        var taxSlab = new TaxSlab(request.Name, request.Rate, request.IsDefault);
        await _taxSlabRepository.AddAsync(taxSlab, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Tax slab created successfully: {TaxSlabId}", taxSlab.Id);

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

