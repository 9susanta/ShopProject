using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Commands.Sales;

public class CreateSaleReturnCommandHandler : IRequestHandler<CreateSaleReturnCommand, SaleReturnDto>
{
    private readonly IRepository<SaleReturn> _saleReturnRepository;
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<SaleItem> _saleItemRepository;
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateSaleReturnCommandHandler> _logger;

    public CreateSaleReturnCommandHandler(
        IRepository<SaleReturn> saleReturnRepository,
        IRepository<Sale> saleRepository,
        IRepository<SaleItem> saleItemRepository,
        IRepository<InventoryEntity> inventoryRepository,
        IRepository<Product> productRepository,
        IRepository<User> userRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateSaleReturnCommandHandler> logger)
    {
        _saleReturnRepository = saleReturnRepository;
        _saleRepository = saleRepository;
        _saleItemRepository = saleItemRepository;
        _inventoryRepository = inventoryRepository;
        _productRepository = productRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<SaleReturnDto> Handle(CreateSaleReturnCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating sale return for sale: {SaleId}", request.SaleId);

        // Validate sale exists and is completed
        var sale = await _saleRepository.GetByIdAsync(request.SaleId, cancellationToken);
        if (sale == null)
            throw new KeyNotFoundException($"Sale with ID {request.SaleId} not found");

        if (sale.Status != Domain.Enums.SaleStatus.Completed)
            throw new InvalidOperationException("Can only return items from completed sales");

        // Generate return number
        var returnNumber = $"RET-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

        // Create return
        var saleReturn = new SaleReturn(
            returnNumber,
            request.SaleId,
            request.ReturnDate,
            request.Reason,
            request.Notes);

        // Validate and add return items
        foreach (var itemCommand in request.Items)
        {
            // Validate sale item exists and belongs to this sale
            var saleItem = await _saleItemRepository.GetByIdAsync(itemCommand.SaleItemId, cancellationToken);
            if (saleItem == null)
                throw new KeyNotFoundException($"Sale item with ID {itemCommand.SaleItemId} not found");

            if (saleItem.SaleId != request.SaleId)
                throw new InvalidOperationException($"Sale item {itemCommand.SaleItemId} does not belong to sale {request.SaleId}");

            // Validate quantity doesn't exceed original quantity
            if (itemCommand.Quantity > saleItem.Quantity)
                throw new InvalidOperationException($"Return quantity ({itemCommand.Quantity}) cannot exceed original quantity ({saleItem.Quantity})");

            // Add return item
            saleReturn.AddItem(
                itemCommand.SaleItemId,
                itemCommand.Quantity,
                itemCommand.UnitPrice,
                itemCommand.Reason);
        }

        if (!saleReturn.Items.Any())
            throw new InvalidOperationException("Cannot create a return without items");

        // Auto-approve for simplicity (can be changed to require approval later)
        // For now, we'll approve immediately and restore inventory
        saleReturn.Approve(Guid.Empty); // TODO: Get current user ID from context

        // Restore inventory for returned items
        await RestoreInventoryAsync(saleReturn, cancellationToken);

        // Save return
        await _saleReturnRepository.AddAsync(saleReturn, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sale return created: {ReturnNumber}", saleReturn.ReturnNumber);

        // Map to DTO
        return await MapToDtoAsync(saleReturn, sale, cancellationToken);
    }

    private async Task RestoreInventoryAsync(SaleReturn saleReturn, CancellationToken cancellationToken)
    {
        foreach (var returnItem in saleReturn.Items)
        {
            var saleItem = await _saleItemRepository.GetByIdAsync(returnItem.SaleItemId, cancellationToken);
            if (saleItem == null) continue;

            // Find inventory for this product
            var inventoryList = await _inventoryRepository.FindAsync(
                i => i.ProductId == saleItem.ProductId,
                cancellationToken);

            var inventory = inventoryList.FirstOrDefault();
            if (inventory != null)
            {
                // Restore stock
                inventory.AddStock(returnItem.Quantity);
                await _inventoryRepository.UpdateAsync(inventory, cancellationToken);
                _logger.LogInformation("Restored {Quantity} units of product {ProductId} to inventory", 
                    returnItem.Quantity, saleItem.ProductId);
            }
            else
            {
                _logger.LogWarning("Inventory not found for product {ProductId}, skipping restoration", 
                    saleItem.ProductId);
            }
        }
    }

    private async Task<SaleReturnDto> MapToDtoAsync(SaleReturn saleReturn, Sale sale, CancellationToken cancellationToken)
    {
        // Load sale items and products for return items
        var saleItemIds = saleReturn.Items.Select(i => i.SaleItemId).ToList();
        var saleItems = saleItemIds.Any()
            ? (await _saleItemRepository.FindAsync(si => saleItemIds.Contains(si.Id), cancellationToken)).ToList()
            : new List<SaleItem>();

        var productIds = saleItems.Select(si => si.ProductId).Distinct().ToList();
        var products = productIds.Any()
            ? (await _productRepository.FindAsync(p => productIds.Contains(p.Id), cancellationToken)).ToList()
            : new List<Domain.Entities.Product>();

        var saleItemLookup = saleItems.ToDictionary(si => si.Id);
        var productLookup = products.ToDictionary(p => p.Id);

        return new SaleReturnDto
        {
            Id = saleReturn.Id,
            ReturnNumber = saleReturn.ReturnNumber,
            SaleId = saleReturn.SaleId,
            SaleInvoiceNumber = sale.InvoiceNumber,
            ReturnDate = saleReturn.ReturnDate,
            Reason = saleReturn.Reason,
            Status = saleReturn.Status,
            TotalRefundAmount = saleReturn.TotalRefundAmount,
            Notes = saleReturn.Notes,
            ProcessedByUserId = saleReturn.ProcessedByUserId,
            ProcessedAt = saleReturn.ProcessedAt,
            CreatedAt = saleReturn.CreatedAt,
            UpdatedAt = saleReturn.UpdatedAt,
            Items = saleReturn.Items.Select(i =>
            {
                var saleItem = saleItemLookup.GetValueOrDefault(i.SaleItemId);
                var product = saleItem != null && productLookup.ContainsKey(saleItem.ProductId)
                    ? productLookup[saleItem.ProductId]
                    : null;

                return new SaleReturnItemDto
                {
                    Id = i.Id,
                    SaleItemId = i.SaleItemId,
                    ProductId = saleItem?.ProductId ?? Guid.Empty,
                    ProductName = product?.Name ?? "Unknown",
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TotalRefundAmount = i.TotalRefundAmount,
                    Reason = i.Reason
                };
            }).ToList()
        };
    }
}

