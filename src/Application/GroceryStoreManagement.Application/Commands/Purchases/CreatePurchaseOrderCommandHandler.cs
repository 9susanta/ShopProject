using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Events;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Purchases;

public class CreatePurchaseOrderCommandHandler : IRequestHandler<CreatePurchaseOrderCommand, PurchaseOrderDto>
{
    private readonly IRepository<PurchaseOrder> _purchaseOrderRepository;
    private readonly IRepository<Supplier> _supplierRepository;
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreatePurchaseOrderCommandHandler> _logger;

    public CreatePurchaseOrderCommandHandler(
        IRepository<PurchaseOrder> purchaseOrderRepository,
        IRepository<Supplier> supplierRepository,
        IMediator mediator,
        IUnitOfWork unitOfWork,
        ILogger<CreatePurchaseOrderCommandHandler> logger)
    {
        _purchaseOrderRepository = purchaseOrderRepository;
        _supplierRepository = supplierRepository;
        _mediator = mediator;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PurchaseOrderDto> Handle(CreatePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating purchase order: {OrderNumber}", request.OrderNumber);

        var supplier = await _supplierRepository.GetByIdAsync(request.SupplierId, cancellationToken);
        if (supplier == null)
            throw new InvalidOperationException($"Supplier with id {request.SupplierId} not found");

        var purchaseOrder = new PurchaseOrder(request.OrderNumber, request.SupplierId, request.ExpectedDeliveryDate);

        foreach (var item in request.Items)
        {
            purchaseOrder.AddItem(item.ProductId, item.Quantity, item.UnitPrice);
        }

        purchaseOrder.Submit();

        await _purchaseOrderRepository.AddAsync(purchaseOrder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Raise domain event
        var items = purchaseOrder.Items.Select(i => new PurchaseCreatedEvent.PurchaseItem(i.ProductId, i.Quantity, i.UnitPrice)).ToList();
        var purchaseCreatedEvent = new PurchaseCreatedEvent(
            purchaseOrder.Id,
            purchaseOrder.OrderNumber,
            purchaseOrder.SupplierId,
            purchaseOrder.OrderDate,
            items);

        await _mediator.Publish(purchaseCreatedEvent, cancellationToken);

        _logger.LogInformation("Purchase order created successfully: {PurchaseOrderId}", purchaseOrder.Id);

        return new PurchaseOrderDto
        {
            Id = purchaseOrder.Id,
            OrderNumber = purchaseOrder.OrderNumber,
            SupplierId = purchaseOrder.SupplierId,
            SupplierName = supplier.Name,
            Status = purchaseOrder.Status.ToString(),
            OrderDate = purchaseOrder.OrderDate,
            ExpectedDeliveryDate = purchaseOrder.ExpectedDeliveryDate,
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

