using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace GroceryStoreManagement.Application.Queries.Purchases;

public class GetGRNsQueryHandler : IRequestHandler<GetGRNsQuery, GRNListResponseDto>
{
    private readonly IRepository<GoodsReceiveNote> _grnRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly ILogger<GetGRNsQueryHandler> _logger;

    public GetGRNsQueryHandler(
        IRepository<GoodsReceiveNote> grnRepository,
        IRepository<Product> productRepository,
        ILogger<GetGRNsQueryHandler> logger)
    {
        _grnRepository = grnRepository;
        _productRepository = productRepository;
        _logger = logger;
    }

    public async Task<GRNListResponseDto> Handle(GetGRNsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching GRNs with filters");

        var allGRNs = await _grnRepository.GetAllAsync(cancellationToken);
        var allProducts = await _productRepository.GetAllAsync(cancellationToken);
        var productsLookup = allProducts.ToDictionary(p => p.Id);

        var grns = allGRNs.AsQueryable();

        if (request.SupplierId.HasValue)
        {
            grns = grns.Where(g => g.SupplierId == request.SupplierId.Value);
        }

        if (request.PurchaseOrderId.HasValue)
        {
            grns = grns.Where(g => g.PurchaseOrderId == request.PurchaseOrderId.Value);
        }

        if (request.StartDate.HasValue)
        {
            grns = grns.Where(g => g.ReceivedDate >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            grns = grns.Where(g => g.ReceivedDate <= request.EndDate.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<GRNStatus>(request.Status, out var status))
            {
                grns = grns.Where(g => g.Status == status);
            }
        }

        var totalCount = grns.Count();

        var pagedGRNs = grns
            .OrderByDescending(g => g.ReceivedDate)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var grnDtos = pagedGRNs.Select(grn => new GRNDto
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
                ProductName = productsLookup.TryGetValue(i.ProductId, out var product) ? product.Name : string.Empty,
                Quantity = i.Quantity,
                UnitCost = i.UnitCost,
                TotalCost = i.TotalCost,
                ExpiryDate = i.ExpiryDate,
                BatchNumber = i.BatchNumber
            }).ToList()
        }).ToList();

        return new GRNListResponseDto
        {
            Items = grnDtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}

