using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Purchases;

public class CancelGRNCommandHandler : IRequestHandler<CancelGRNCommand, GRNDto>
{
    private readonly IRepository<GoodsReceiveNote> _grnRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CancelGRNCommandHandler> _logger;

    public CancelGRNCommandHandler(
        IRepository<GoodsReceiveNote> grnRepository,
        IUnitOfWork unitOfWork,
        ILogger<CancelGRNCommandHandler> logger)
    {
        _grnRepository = grnRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<GRNDto> Handle(CancelGRNCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Cancelling GRN: {GRNId}", request.Id);

        var grn = await _grnRepository.GetByIdAsync(request.Id, cancellationToken);
        if (grn == null)
            throw new InvalidOperationException($"GRN with ID '{request.Id}' not found.");

        grn.Cancel();
        await _grnRepository.UpdateAsync(grn, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("GRN cancelled successfully: {GRNId}", grn.Id);

        return new GRNDto
        {
            Id = grn.Id,
            GRNNumber = grn.GRNNumber,
            SupplierId = grn.SupplierId,
            PurchaseOrderId = grn.PurchaseOrderId,
            Status = grn.Status.ToString(),
            ReceivedDate = grn.ReceivedDate,
            InvoiceNumber = grn.InvoiceNumber,
            InvoiceFilePath = grn.InvoiceFilePath,
            TotalAmount = grn.TotalAmount,
            Notes = grn.Notes,
            IdempotencyKey = grn.IdempotencyKey,
            CreatedAt = grn.CreatedAt,
            UpdatedAt = grn.UpdatedAt,
            Items = grn.Items.Select(i => new GRNItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitCost = i.UnitCost,
                TotalCost = i.TotalCost,
                ExpiryDate = i.ExpiryDate,
                BatchNumber = i.BatchNumber
            }).ToList()
        };
    }
}

