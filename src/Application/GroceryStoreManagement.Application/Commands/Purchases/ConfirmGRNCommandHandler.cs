using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Events;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Purchases;

public class ConfirmGRNCommandHandler : IRequestHandler<ConfirmGRNCommand, GRNDto>
{
    private readonly IRepository<GoodsReceiveNote> _grnRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMediator _mediator;
    private readonly ILogger<ConfirmGRNCommandHandler> _logger;

    public ConfirmGRNCommandHandler(
        IRepository<GoodsReceiveNote> grnRepository,
        IUnitOfWork unitOfWork,
        IMediator mediator,
        ILogger<ConfirmGRNCommandHandler> logger)
    {
        _grnRepository = grnRepository;
        _unitOfWork = unitOfWork;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<GRNDto> Handle(ConfirmGRNCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Confirming GRN: {GRNId}", request.Id);

        // Check idempotency if key provided
        if (!string.IsNullOrWhiteSpace(request.IdempotencyKey))
        {
            var existingGRN = (await _grnRepository.FindAsync(
                g => g.IdempotencyKey == request.IdempotencyKey && g.Status == Domain.Enums.GRNStatus.Confirmed,
                cancellationToken)).FirstOrDefault();

            if (existingGRN != null)
            {
                _logger.LogInformation("GRN already confirmed with idempotency key: {IdempotencyKey}", request.IdempotencyKey);
                return MapToDto(existingGRN);
            }
        }

        var grn = await _grnRepository.GetByIdAsync(request.Id, cancellationToken);
        if (grn == null)
            throw new InvalidOperationException($"GRN with ID '{request.Id}' not found.");

        // Confirm GRN
        grn.Confirm();
        await _grnRepository.UpdateAsync(grn, cancellationToken);

        // Raise domain event for stock update
        var grnConfirmedEvent = new GRNConfirmedEvent(
            grn.Id,
            grn.GRNNumber,
            grn.SupplierId,
            grn.PurchaseOrderId,
            DateTime.UtcNow,
            grn.TotalAmount,
            grn.Items.Select(i => new GRNItemDetail(
                i.ProductId,
                i.Quantity,
                i.UnitCost,
                i.ExpiryDate,
                i.BatchNumber)).ToList());

        await _mediator.Publish(grnConfirmedEvent, cancellationToken);

        // Note: Purchase order status update should be handled separately if needed
        // The GRN confirmation doesn't automatically mark PO as received

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("GRN confirmed successfully: {GRNId}", grn.Id);

        return MapToDto(grn);
    }

    private GRNDto MapToDto(GoodsReceiveNote grn)
    {
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

