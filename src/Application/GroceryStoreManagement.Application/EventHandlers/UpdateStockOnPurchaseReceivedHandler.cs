using MediatR;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Events;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.EventHandlers;

public class UpdateStockOnPurchaseReceivedHandler : INotificationHandler<PurchaseReceivedEvent>
{
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMediator _mediator;
    private readonly ILogger<UpdateStockOnPurchaseReceivedHandler> _logger;

    public UpdateStockOnPurchaseReceivedHandler(
        IRepository<InventoryEntity> inventoryRepository,
        IRepository<Product> productRepository,
        IUnitOfWork unitOfWork,
        IMediator mediator,
        ILogger<UpdateStockOnPurchaseReceivedHandler> logger)
    {
        _inventoryRepository = inventoryRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task Handle(PurchaseReceivedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating stock for purchase order: {PurchaseOrderId}", notification.PurchaseOrderId);

        foreach (var item in notification.Items)
        {
            var inventoryList = await _inventoryRepository.FindAsync(i => i.ProductId == item.ProductId, cancellationToken);
            var inventory = inventoryList.FirstOrDefault();

            if (inventory == null)
            {
                _logger.LogWarning("Inventory not found for product: {ProductId}, creating new inventory", item.ProductId);
                inventory = new InventoryEntity(item.ProductId, 0);
                await _inventoryRepository.AddAsync(inventory, cancellationToken);
            }

            inventory.AddStock(item.Quantity);
            await _inventoryRepository.UpdateAsync(inventory, cancellationToken);

            _logger.LogInformation("Added {Quantity} units to inventory for product: {ProductId}", item.Quantity, item.ProductId);

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
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Stock updated successfully for purchase order: {PurchaseOrderId}", notification.PurchaseOrderId);
    }
}

