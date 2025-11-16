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

            inventory.RemoveStock(item.Quantity);
            await _inventoryRepository.UpdateAsync(inventory, cancellationToken);

            _logger.LogInformation("Removed {Quantity} units from inventory for product: {ProductId}", item.Quantity, item.ProductId);

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

