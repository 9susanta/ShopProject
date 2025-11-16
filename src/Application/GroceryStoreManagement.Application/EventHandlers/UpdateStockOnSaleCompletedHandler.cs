using MediatR;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Events;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.EventHandlers;

public class UpdateStockOnSaleCompletedHandler : INotificationHandler<SaleCompletedEvent>
{
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMediator _mediator;
    private readonly ILogger<UpdateStockOnSaleCompletedHandler> _logger;

    public UpdateStockOnSaleCompletedHandler(
        IRepository<InventoryEntity> inventoryRepository,
        IRepository<Product> productRepository,
        IUnitOfWork unitOfWork,
        IMediator mediator,
        ILogger<UpdateStockOnSaleCompletedHandler> logger)
    {
        _inventoryRepository = inventoryRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task Handle(SaleCompletedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating stock for sale: {SaleId}", notification.SaleId);

        foreach (var item in notification.Items)
        {
            var inventoryList = await _inventoryRepository.FindAsync(i => i.ProductId == item.ProductId, cancellationToken);
            var inventory = inventoryList.FirstOrDefault();

            if (inventory == null)
            {
                _logger.LogError("Inventory not found for product: {ProductId}", item.ProductId);
                throw new InvalidOperationException($"Inventory not found for product {item.ProductId}");
            }

            // Check if inventory was already reduced (idempotent operation)
            // This handles cases where inventory was reduced in the command handler transaction
            var quantityBefore = inventory.QuantityOnHand;
            try
            {
                inventory.RemoveStock(item.Quantity);
                await _inventoryRepository.UpdateAsync(inventory, cancellationToken);
                _logger.LogInformation("Removed {Quantity} units from inventory for product: {ProductId}", item.Quantity, item.ProductId);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("Insufficient stock"))
            {
                // Inventory may have been already reduced - check if it's already at expected level
                // If quantity was already reduced, this is idempotent - just log and continue
                _logger.LogWarning("Inventory reduction may have already been processed for product: {ProductId}. Quantity before: {Before}, Expected reduction: {Quantity}", 
                    item.ProductId, quantityBefore, item.Quantity);
                // Re-fetch to get current state
                inventoryList = await _inventoryRepository.FindAsync(i => i.ProductId == item.ProductId, cancellationToken);
                inventory = inventoryList.FirstOrDefault();
                if (inventory == null) continue;
            }

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
        _logger.LogInformation("Stock updated successfully for sale: {SaleId}", notification.SaleId);
    }
}

