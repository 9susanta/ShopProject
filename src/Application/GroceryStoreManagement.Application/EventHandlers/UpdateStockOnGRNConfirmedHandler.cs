using MediatR;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Events;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.EventHandlers;

/// <summary>
/// Handles GRNConfirmedEvent - creates inventory batches and updates stock
/// </summary>
public class UpdateStockOnGRNConfirmedHandler : INotificationHandler<GRNConfirmedEvent>
{
    private readonly IRepository<InventoryBatch> _batchRepository;
    private readonly IRepository<Inventory> _inventoryRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<InventoryAudit> _auditRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMediator _mediator;
    private readonly ILogger<UpdateStockOnGRNConfirmedHandler> _logger;

    public UpdateStockOnGRNConfirmedHandler(
        IRepository<InventoryBatch> batchRepository,
        IRepository<Inventory> inventoryRepository,
        IRepository<Product> productRepository,
        IRepository<InventoryAudit> auditRepository,
        IUnitOfWork unitOfWork,
        IMediator mediator,
        ILogger<UpdateStockOnGRNConfirmedHandler> logger)
    {
        _batchRepository = batchRepository;
        _inventoryRepository = inventoryRepository;
        _productRepository = productRepository;
        _auditRepository = auditRepository;
        _unitOfWork = unitOfWork;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task Handle(GRNConfirmedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating stock for GRN: {GRNId}", notification.GRNId);

        foreach (var item in notification.Items)
        {
            // Get or create inventory
            var inventoryList = await _inventoryRepository.FindAsync(i => i.ProductId == item.ProductId, cancellationToken);
            var inventory = inventoryList.FirstOrDefault();

            if (inventory == null)
            {
                _logger.LogWarning("Inventory not found for product: {ProductId}, creating new inventory", item.ProductId);
                inventory = new Inventory(item.ProductId, 0, item.ExpiryDate);
                await _inventoryRepository.AddAsync(inventory, cancellationToken);
            }

            var quantityBefore = inventory.QuantityOnHand;

            // Create inventory batch
            var batch = new InventoryBatch(
                item.ProductId,
                item.Quantity,
                item.UnitCost,
                notification.ConfirmedDate,
                item.ExpiryDate,
                item.BatchNumber,
                notification.PurchaseOrderId,
                notification.GRNId);

            await _batchRepository.AddAsync(batch, cancellationToken);

            // Update inventory quantity
            inventory.AddStock(item.Quantity);
            await _inventoryRepository.UpdateAsync(inventory, cancellationToken);

            // Create audit log
            var audit = new InventoryAudit(
                item.ProductId,
                InventoryAdjustmentType.Purchase,
                item.Quantity,
                quantityBefore,
                inventory.QuantityOnHand,
                $"GRN {notification.GRNNumber} - Received {item.Quantity} units",
                batch.Id,
                notification.GRNNumber,
                notification.GRNId);

            await _auditRepository.AddAsync(audit, cancellationToken);

            _logger.LogInformation("Created batch and added {Quantity} units to inventory for product: {ProductId}",
                item.Quantity, item.ProductId);

            // Check for low stock
            var product = await _productRepository.GetByIdAsync(item.ProductId, cancellationToken);
            if (product != null && inventory.IsLowStock(product.LowStockThreshold))
            {
                var lowStockEvent = new LowStockEvent(
                    product.Id,
                    product.Name,
                    product.SKU,
                    inventory.AvailableQuantity,
                    product.LowStockThreshold);

                await _mediator.Publish(lowStockEvent, cancellationToken);
            }

            // Check for expiry soon
            if (item.ExpiryDate.HasValue && batch.IsExpiringSoon(7))
            {
                var daysUntilExpiry = (item.ExpiryDate.Value - DateTime.UtcNow).Days;
                var expiryEvent = new ExpirySoonEvent(
                    item.ProductId,
                    product?.Name ?? "Unknown",
                    product?.SKU ?? "Unknown",
                    item.ExpiryDate.Value,
                    daysUntilExpiry);

                await _mediator.Publish(expiryEvent, cancellationToken);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Stock updated successfully for GRN: {GRNId}", notification.GRNId);
    }
}

