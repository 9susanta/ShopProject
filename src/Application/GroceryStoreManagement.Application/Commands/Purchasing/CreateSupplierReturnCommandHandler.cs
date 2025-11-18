using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Commands.Purchasing;

public class CreateSupplierReturnCommandHandler : IRequestHandler<CreateSupplierReturnCommand, SupplierReturnDto>
{
    private readonly IRepository<SupplierReturn> _supplierReturnRepository;
    private readonly IRepository<Supplier> _supplierRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly IRepository<GoodsReceiveNote> _grnRepository;
    private readonly IRepository<InventoryBatch> _batchRepository;
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateSupplierReturnCommandHandler> _logger;

    public CreateSupplierReturnCommandHandler(
        IRepository<SupplierReturn> supplierReturnRepository,
        IRepository<Supplier> supplierRepository,
        IRepository<Product> productRepository,
        IRepository<InventoryEntity> inventoryRepository,
        IRepository<GoodsReceiveNote> grnRepository,
        IRepository<InventoryBatch> batchRepository,
        IMediator mediator,
        IUnitOfWork unitOfWork,
        ILogger<CreateSupplierReturnCommandHandler> logger)
    {
        _supplierReturnRepository = supplierReturnRepository;
        _supplierRepository = supplierRepository;
        _productRepository = productRepository;
        _inventoryRepository = inventoryRepository;
        _grnRepository = grnRepository;
        _batchRepository = batchRepository;
        _mediator = mediator;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<SupplierReturnDto> Handle(CreateSupplierReturnCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating supplier return for supplier: {SupplierId}", request.SupplierId);

        // Validate supplier exists
        var supplier = await _supplierRepository.GetByIdAsync(request.SupplierId, cancellationToken);
        if (supplier == null)
            throw new KeyNotFoundException($"Supplier with ID {request.SupplierId} not found.");

        // Validate GRN if provided
        GoodsReceiveNote? grn = null;
        if (request.GRNId.HasValue)
        {
            grn = await _grnRepository.GetByIdAsync(request.GRNId.Value, cancellationToken);
            if (grn == null)
                throw new KeyNotFoundException($"GRN with ID {request.GRNId.Value} not found.");
            if (grn.SupplierId != request.SupplierId)
                throw new InvalidOperationException("GRN does not belong to the specified supplier.");
        }

        // Generate return number
        var returnNumber = $"SR-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

        // Create supplier return
        var supplierReturn = new SupplierReturn(
            returnNumber,
            request.SupplierId,
            request.ReturnDate,
            request.Reason,
            request.GRNId,
            request.Notes);

        // Add items and validate
        foreach (var itemCommand in request.Items)
        {
            var product = await _productRepository.GetByIdAsync(itemCommand.ProductId, cancellationToken);
            if (product == null)
                throw new KeyNotFoundException($"Product with ID {itemCommand.ProductId} not found.");

            // Validate batch if provided
            if (itemCommand.BatchId.HasValue)
            {
                var batch = await _batchRepository.GetByIdAsync(itemCommand.BatchId.Value, cancellationToken);
                if (batch == null)
                    throw new KeyNotFoundException($"Batch with ID {itemCommand.BatchId.Value} not found.");
                if (batch.ProductId != itemCommand.ProductId)
                    throw new InvalidOperationException("Batch does not belong to the specified product.");
            }

            // Check inventory availability
            var inventoryList = await _inventoryRepository.FindAsync(i => i.ProductId == itemCommand.ProductId, cancellationToken);
            var inventory = inventoryList.FirstOrDefault();
            if (inventory == null)
                throw new InvalidOperationException($"Inventory not found for product {product.Name}.");

            if (inventory.AvailableQuantity < itemCommand.Quantity)
                throw new InvalidOperationException($"Insufficient stock for product {product.Name}. Available: {inventory.AvailableQuantity}, Requested: {itemCommand.Quantity}");

            supplierReturn.AddItem(
                itemCommand.ProductId,
                itemCommand.BatchId,
                itemCommand.Quantity,
                itemCommand.UnitCost,
                itemCommand.Reason);
        }

        if (!supplierReturn.Items.Any())
            throw new InvalidOperationException("Cannot create a supplier return without items.");

        // Save supplier return
        await _supplierReturnRepository.AddAsync(supplierReturn, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Reduce inventory for each item
        foreach (var returnItem in supplierReturn.Items)
        {
            var inventoryList = await _inventoryRepository.FindAsync(i => i.ProductId == returnItem.ProductId, cancellationToken);
            var inventory = inventoryList.FirstOrDefault();
            if (inventory != null)
            {
                inventory.RemoveStock(returnItem.Quantity);
                await _inventoryRepository.UpdateAsync(inventory, cancellationToken);
                _logger.LogInformation("Removed {Quantity} units from inventory for product {ProductId} due to supplier return.", 
                    returnItem.Quantity, returnItem.ProductId);
            }
        }

        // Create inventory adjustments
        // Note: We'll use the AdjustInventoryCommand to create proper adjustment records
        // For now, we'll just update inventory directly and create adjustments manually
        // TODO: Consider using AdjustInventoryCommand via mediator for consistency

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Publish domain event
        var returnEvent = new Domain.Events.SupplierReturnEvent(
            supplierReturn.Id,
            supplierReturn.ReturnNumber,
            supplierReturn.SupplierId,
            supplierReturn.GRNId,
            supplierReturn.ReturnDate,
            supplierReturn.TotalAmount,
            supplierReturn.Reason,
            supplierReturn.Items.Select(i => new Domain.Events.SupplierReturnItemDetail(
                i.ProductId,
                i.BatchId,
                i.Quantity,
                i.UnitCost,
                i.Reason)).ToList());

        await _mediator.Publish(returnEvent, cancellationToken);

        _logger.LogInformation("Supplier return created: {ReturnNumber}", supplierReturn.ReturnNumber);

        // Map to DTO
        return await MapToDtoAsync(supplierReturn, supplier, grn, cancellationToken);
    }

    private async Task<SupplierReturnDto> MapToDtoAsync(
        SupplierReturn supplierReturn,
        Supplier supplier,
        GoodsReceiveNote? grn,
        CancellationToken cancellationToken)
    {
        // Load products and batches for return items
        var productIds = supplierReturn.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = productIds.Any()
            ? (await _productRepository.FindAsync(p => productIds.Contains(p.Id), cancellationToken)).ToList()
            : new List<Product>();

        var batchIds = supplierReturn.Items.Where(i => i.BatchId.HasValue).Select(i => i.BatchId!.Value).Distinct().ToList();
        var batches = batchIds.Any()
            ? (await _batchRepository.FindAsync(b => batchIds.Contains(b.Id), cancellationToken)).ToList()
            : new List<InventoryBatch>();

        var productLookup = products.ToDictionary(p => p.Id);
        var batchLookup = batches.ToDictionary(b => b.Id);

        return new SupplierReturnDto
        {
            Id = supplierReturn.Id,
            ReturnNumber = supplierReturn.ReturnNumber,
            SupplierId = supplierReturn.SupplierId,
            SupplierName = supplier.Name,
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

