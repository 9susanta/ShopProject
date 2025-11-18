using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Purchasing;

public class GetSupplierReturnByIdQueryHandler : IRequestHandler<GetSupplierReturnByIdQuery, SupplierReturnDto?>
{
    private readonly IRepository<SupplierReturn> _supplierReturnRepository;
    private readonly IRepository<Supplier> _supplierRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<GoodsReceiveNote> _grnRepository;
    private readonly IRepository<InventoryBatch> _batchRepository;
    private readonly ILogger<GetSupplierReturnByIdQueryHandler> _logger;

    public GetSupplierReturnByIdQueryHandler(
        IRepository<SupplierReturn> supplierReturnRepository,
        IRepository<Supplier> supplierRepository,
        IRepository<Product> productRepository,
        IRepository<GoodsReceiveNote> grnRepository,
        IRepository<InventoryBatch> batchRepository,
        ILogger<GetSupplierReturnByIdQueryHandler> logger)
    {
        _supplierReturnRepository = supplierReturnRepository;
        _supplierRepository = supplierRepository;
        _productRepository = productRepository;
        _grnRepository = grnRepository;
        _batchRepository = batchRepository;
        _logger = logger;
    }

    public async Task<SupplierReturnDto?> Handle(GetSupplierReturnByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving supplier return: {ReturnId}", request.Id);

        var supplierReturn = await _supplierReturnRepository.GetByIdAsync(request.Id, cancellationToken);
        if (supplierReturn == null)
            return null;

        // Load related data
        var supplier = await _supplierRepository.GetByIdAsync(supplierReturn.SupplierId, cancellationToken);
        var supplierLookup = supplier != null ? new Dictionary<Guid, Supplier> { [supplier.Id] = supplier } : new Dictionary<Guid, Supplier>();

        GoodsReceiveNote? grn = null;
        var grnLookup = new Dictionary<Guid, GoodsReceiveNote>();
        if (supplierReturn.GRNId.HasValue)
        {
            grn = await _grnRepository.GetByIdAsync(supplierReturn.GRNId.Value, cancellationToken);
            if (grn != null)
                grnLookup[grn.Id] = grn;
        }

        // Load products and batches
        var productIds = supplierReturn.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = productIds.Any()
            ? (await _productRepository.FindAsync(p => productIds.Contains(p.Id), cancellationToken)).ToList()
            : new List<Product>();
        var productLookup = products.ToDictionary(p => p.Id);

        var batchIds = supplierReturn.Items.Where(i => i.BatchId.HasValue).Select(i => i.BatchId!.Value).Distinct().ToList();
        var batches = batchIds.Any()
            ? (await _batchRepository.FindAsync(b => batchIds.Contains(b.Id), cancellationToken)).ToList()
            : new List<InventoryBatch>();
        var batchLookup = batches.ToDictionary(b => b.Id);

        return MapToDto(supplierReturn, supplierLookup, grnLookup, productLookup, batchLookup);
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



