using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Purchases;

public class GetPurchaseOrderByIdQueryHandler : IRequestHandler<GetPurchaseOrderByIdQuery, PurchaseOrderDto?>
{
    private readonly IRepository<PurchaseOrder> _purchaseOrderRepository;
    private readonly IRepository<Supplier> _supplierRepository;
    private readonly ILogger<GetPurchaseOrderByIdQueryHandler> _logger;

    public GetPurchaseOrderByIdQueryHandler(
        IRepository<PurchaseOrder> purchaseOrderRepository,
        IRepository<Supplier> supplierRepository,
        ILogger<GetPurchaseOrderByIdQueryHandler> logger)
    {
        _purchaseOrderRepository = purchaseOrderRepository;
        _supplierRepository = supplierRepository;
        _logger = logger;
    }

    public async Task<PurchaseOrderDto?> Handle(GetPurchaseOrderByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching purchase order by ID: {PurchaseOrderId}", request.Id);

        var purchaseOrder = await _purchaseOrderRepository.GetByIdAsync(request.Id, cancellationToken);
        if (purchaseOrder == null)
            return null;

        var supplier = await _supplierRepository.GetByIdAsync(purchaseOrder.SupplierId, cancellationToken);

        return new PurchaseOrderDto
        {
            Id = purchaseOrder.Id,
            OrderNumber = purchaseOrder.OrderNumber,
            SupplierId = purchaseOrder.SupplierId,
            SupplierName = supplier?.Name ?? string.Empty,
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

