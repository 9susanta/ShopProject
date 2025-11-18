using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Purchasing;

public class GetSupplierReturnsQueryHandler : IRequestHandler<GetSupplierReturnsQuery, List<SupplierReturnDto>>
{
    private readonly IRepository<SupplierReturn> _supplierReturnRepository;
    private readonly IRepository<Supplier> _supplierRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<GoodsReceiveNote> _grnRepository;
    private readonly IRepository<InventoryBatch> _batchRepository;
    private readonly ILogger<GetSupplierReturnsQueryHandler> _logger;

    public GetSupplierReturnsQueryHandler(
        IRepository<SupplierReturn> supplierReturnRepository,
        IRepository<Supplier> supplierRepository,
        IRepository<Product> productRepository,
        IRepository<GoodsReceiveNote> grnRepository,
        IRepository<InventoryBatch> batchRepository,
        ILogger<GetSupplierReturnsQueryHandler> logger)
    {
        _supplierReturnRepository = supplierReturnRepository;
        _supplierRepository = supplierRepository;
        _productRepository = productRepository;
        _grnRepository = grnRepository;
        _batchRepository = batchRepository;
        _logger = logger;
    }

    public async Task<List<SupplierReturnDto>> Handle(GetSupplierReturnsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving supplier returns with filters: SupplierId={SupplierId}, GRNId={GRNId}",
            request.SupplierId, request.GRNId);

        var returns = await _supplierReturnRepository.GetAllAsync(cancellationToken);

        var filteredReturns = returns.AsQueryable();

        if (request.SupplierId.HasValue)
        {
            filteredReturns = filteredReturns.Where(r => r.SupplierId == request.SupplierId.Value);
        }

        if (request.GRNId.HasValue)
        {
            filteredReturns = filteredReturns.Where(r => r.GRNId == request.GRNId.Value);
        }

        if (request.StartDate.HasValue)
        {
            filteredReturns = filteredReturns.Where(r => r.ReturnDate >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            filteredReturns = filteredReturns.Where(r => r.ReturnDate <= request.EndDate.Value);
        }

        var returnList = filteredReturns
            .OrderByDescending(r => r.ReturnDate)
            .ToList();

        // Load related data
        var supplierIds = returnList.Select(r => r.SupplierId).Distinct().ToList();
        var suppliers = supplierIds.Any()
            ? (await _supplierRepository.FindAsync(s => supplierIds.Contains(s.Id), cancellationToken)).ToList()
            : new List<Supplier>();
        var supplierLookup = suppliers.ToDictionary(s => s.Id);

        var grnIds = returnList.Where(r => r.GRNId.HasValue).Select(r => r.GRNId!.Value).Distinct().ToList();
        var grns = grnIds.Any()
            ? (await _grnRepository.FindAsync(g => grnIds.Contains(g.Id), cancellationToken)).ToList()
            : new List<GoodsReceiveNote>();
        var grnLookup = grns.ToDictionary(g => g.Id);

        // Load products and batches for return items
        var allProductIds = returnList.SelectMany(r => r.Items.Select(i => i.ProductId)).Distinct().ToList();
        var products = allProductIds.Any()
            ? (await _productRepository.FindAsync(p => allProductIds.Contains(p.Id), cancellationToken)).ToList()
            : new List<Product>();
        var productLookup = products.ToDictionary(p => p.Id);

        var allBatchIds = returnList.SelectMany(r => r.Items.Where(i => i.BatchId.HasValue).Select(i => i.BatchId!.Value)).Distinct().ToList();
        var batches = allBatchIds.Any()
            ? (await _batchRepository.FindAsync(b => allBatchIds.Contains(b.Id), cancellationToken)).ToList()
            : new List<InventoryBatch>();
        var batchLookup = batches.ToDictionary(b => b.Id);

        return returnList.Select(r => MapToDto(r, supplierLookup, grnLookup, productLookup, batchLookup)).ToList();
    }

    private SupplierReturnDto MapToDto(
        SupplierReturn supplierReturn,
        Dictionary<Guid, Supplier> supplierLookup,
        Dictionary<Guid, GoodsReceiveNote> grnLookup,
        Dictionary<Guid, Product> productLookup,
        Dictionary<Guid, InventoryBatch> batchLookup)
    {
        var supplier = supplierLookup.GetValueOrDefault(supplierReturn.SupplierId);
        var grn = supplierReturn.GRNId.HasValue && grnLookup.ContainsKey(supplierReturn.GRNId.Value)
            ? grnLookup[supplierReturn.GRNId.Value]
            : null;

        return new SupplierReturnDto
        {
            Id = supplierReturn.Id,
            ReturnNumber = supplierReturn.ReturnNumber,
            SupplierId = supplierReturn.SupplierId,
            SupplierName = supplier?.Name ?? "Unknown",
            GRNId = supplierReturn.GRNId,
            GRNNumber = grn?.GRNNumber,
            ReturnDate = supplierReturn.ReturnDate,
            TotalAmount = supplierReturn.TotalAmount,
            Reason = supplierReturn.Reason,
            Notes = supplierReturn.Notes,
            CreatedAt = supplierReturn.CreatedAt,
            UpdatedAt = supplierReturn.UpdatedAt,
            Items = supplierReturn.Items.Select(i =>
            {
                var product = productLookup.GetValueOrDefault(i.ProductId);
                var batch = i.BatchId.HasValue && batchLookup.ContainsKey(i.BatchId.Value)
                    ? batchLookup[i.BatchId.Value]
                    : null;

                return new SupplierReturnItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = product?.Name ?? "Unknown",
                    ProductSKU = product?.SKU ?? string.Empty,
                    BatchId = i.BatchId,
                    BatchNumber = batch?.BatchNumber,
                    Quantity = i.Quantity,
                    UnitCost = i.UnitCost,
                    TotalCost = i.TotalCost,
                    Reason = i.Reason
                };
            }).ToList()
        };
    }
}



