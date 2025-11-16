using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace GroceryStoreManagement.Application.Queries.Purchases;

public class GetPurchaseOrdersQueryHandler : IRequestHandler<GetPurchaseOrdersQuery, PurchaseOrderListResponseDto>
{
    private readonly IRepository<PurchaseOrder> _purchaseOrderRepository;
    private readonly ILogger<GetPurchaseOrdersQueryHandler> _logger;

    public GetPurchaseOrdersQueryHandler(
        IRepository<PurchaseOrder> purchaseOrderRepository,
        ILogger<GetPurchaseOrdersQueryHandler> logger)
    {
        _purchaseOrderRepository = purchaseOrderRepository;
        _logger = logger;
    }

    public async Task<PurchaseOrderListResponseDto> Handle(GetPurchaseOrdersQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching purchase orders with filters");

        var allPurchaseOrders = await _purchaseOrderRepository.GetAllAsync(cancellationToken);
        var purchaseOrders = allPurchaseOrders.AsQueryable();

        if (request.SupplierId.HasValue)
        {
            purchaseOrders = purchaseOrders.Where(po => po.SupplierId == request.SupplierId.Value);
        }

        if (request.StartDate.HasValue)
        {
            purchaseOrders = purchaseOrders.Where(po => po.OrderDate >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            purchaseOrders = purchaseOrders.Where(po => po.OrderDate <= request.EndDate.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<PurchaseOrderStatus>(request.Status, out var status))
            {
                purchaseOrders = purchaseOrders.Where(po => po.Status == status);
            }
        }

        var totalCount = purchaseOrders.Count();

        var pagedPurchaseOrders = purchaseOrders
            .OrderByDescending(po => po.OrderDate)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var purchaseOrderDtos = pagedPurchaseOrders.Select(po => new PurchaseOrderDto
        {
            Id = po.Id,
            OrderNumber = po.OrderNumber,
            SupplierId = po.SupplierId,
            Status = po.Status.ToString(),
            OrderDate = po.OrderDate,
            ExpectedDeliveryDate = po.ExpectedDeliveryDate,
            ReceivedDate = po.ReceivedDate,
            TotalAmount = po.TotalAmount
        }).ToList();

        return new PurchaseOrderListResponseDto
        {
            Items = purchaseOrderDtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}

