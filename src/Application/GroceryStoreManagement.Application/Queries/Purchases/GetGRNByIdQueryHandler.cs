using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Purchases;

public class GetGRNByIdQueryHandler : IRequestHandler<GetGRNByIdQuery, GRNDto?>
{
    private readonly IRepository<GoodsReceiveNote> _grnRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly ILogger<GetGRNByIdQueryHandler> _logger;

    public GetGRNByIdQueryHandler(
        IRepository<GoodsReceiveNote> grnRepository,
        IRepository<Product> productRepository,
        ILogger<GetGRNByIdQueryHandler> logger)
    {
        _grnRepository = grnRepository;
        _productRepository = productRepository;
        _logger = logger;
    }

    public async Task<GRNDto?> Handle(GetGRNByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching GRN by ID: {GRNId}", request.Id);

        var grn = await _grnRepository.GetByIdAsync(request.Id, cancellationToken);
        if (grn == null)
            return null;

        var allProducts = await _productRepository.GetAllAsync(cancellationToken);
        var productsLookup = allProducts.ToDictionary(p => p.Id);

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
                ProductName = productsLookup.TryGetValue(i.ProductId, out var product) ? product.Name : string.Empty,
                Quantity = i.Quantity,
                UnitCost = i.UnitCost,
                TotalCost = i.TotalCost,
                ExpiryDate = i.ExpiryDate,
                BatchNumber = i.BatchNumber
            }).ToList()
        };
    }
}

