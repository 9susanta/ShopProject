using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Purchases;

public class CancelPurchaseOrderCommandHandler : IRequestHandler<CancelPurchaseOrderCommand, PurchaseOrderDto>
{
    private readonly IRepository<PurchaseOrder> _purchaseOrderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CancelPurchaseOrderCommandHandler> _logger;

    public CancelPurchaseOrderCommandHandler(
        IRepository<PurchaseOrder> purchaseOrderRepository,
        IUnitOfWork unitOfWork,
        ILogger<CancelPurchaseOrderCommandHandler> logger)
    {
        _purchaseOrderRepository = purchaseOrderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PurchaseOrderDto> Handle(CancelPurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Cancelling purchase order: {PurchaseOrderId}", request.Id);

        var purchaseOrder = await _purchaseOrderRepository.GetByIdAsync(request.Id, cancellationToken);
        if (purchaseOrder == null)
            throw new InvalidOperationException($"Purchase order with ID '{request.Id}' not found.");

        purchaseOrder.Cancel();
        await _purchaseOrderRepository.UpdateAsync(purchaseOrder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Purchase order cancelled successfully: {PurchaseOrderId}", purchaseOrder.Id);

        return new PurchaseOrderDto
        {
            Id = purchaseOrder.Id,
            OrderNumber = purchaseOrder.OrderNumber,
            SupplierId = purchaseOrder.SupplierId,
            Status = purchaseOrder.Status.ToString(),
            OrderDate = purchaseOrder.OrderDate,
            ExpectedDeliveryDate = purchaseOrder.ExpectedDeliveryDate,
            ReceivedDate = purchaseOrder.ReceivedDate,
            TotalAmount = purchaseOrder.TotalAmount
        };
    }
}

