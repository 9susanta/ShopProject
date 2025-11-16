using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Events;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Purchases;

public class ReceivePurchaseOrderCommandHandler : IRequestHandler<ReceivePurchaseOrderCommand, PurchaseOrderDto>
{
    private readonly IRepository<PurchaseOrder> _purchaseOrderRepository;
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ReceivePurchaseOrderCommandHandler> _logger;

    public ReceivePurchaseOrderCommandHandler(
        IRepository<PurchaseOrder> purchaseOrderRepository,
        IMediator mediator,
        IUnitOfWork unitOfWork,
        ILogger<ReceivePurchaseOrderCommandHandler> logger)
    {
        _purchaseOrderRepository = purchaseOrderRepository;
        _mediator = mediator;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PurchaseOrderDto> Handle(ReceivePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Receiving purchase order: {PurchaseOrderId}", request.PurchaseOrderId);

        var purchaseOrder = await _purchaseOrderRepository.GetByIdAsync(request.PurchaseOrderId, cancellationToken);
        if (purchaseOrder == null)
            throw new InvalidOperationException($"Purchase order with id {request.PurchaseOrderId} not found");

        purchaseOrder.Receive(request.ReceivedDate);

        await _purchaseOrderRepository.UpdateAsync(purchaseOrder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Raise domain event
        var items = purchaseOrder.Items.Select(i => new PurchaseReceivedEvent.PurchaseItem(i.ProductId, i.Quantity, i.UnitPrice)).ToList();
        var purchaseReceivedEvent = new PurchaseReceivedEvent(
            purchaseOrder.Id,
            purchaseOrder.OrderNumber,
            request.ReceivedDate,
            items);

        await _mediator.Publish(purchaseReceivedEvent, cancellationToken);

        _logger.LogInformation("Purchase order received successfully: {PurchaseOrderId}", purchaseOrder.Id);

        return new PurchaseOrderDto
        {
            Id = purchaseOrder.Id,
            OrderNumber = purchaseOrder.OrderNumber,
            SupplierId = purchaseOrder.SupplierId,
            Status = purchaseOrder.Status.ToString(),
            OrderDate = purchaseOrder.OrderDate,
            ExpectedDeliveryDate = purchaseOrder.ExpectedDeliveryDate,
            ReceivedDate = purchaseOrder.ReceivedDate,
            TotalAmount = purchaseOrder.TotalAmount,
            Items = purchaseOrder.Items.Select(i => new PurchaseOrderItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.Quantity * i.UnitPrice
            }).ToList()
        };
    }
}

