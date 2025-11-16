using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Events;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Commands.Inventory;

public class AdjustInventoryCommandHandler : IRequestHandler<AdjustInventoryCommand, InventoryAdjustmentDto>
{
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<InventoryAdjustment> _adjustmentRepository;
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AdjustInventoryCommandHandler> _logger;

    public AdjustInventoryCommandHandler(
        IRepository<InventoryEntity> inventoryRepository,
        IRepository<Product> productRepository,
        IRepository<InventoryAdjustment> adjustmentRepository,
        IMediator mediator,
        IUnitOfWork unitOfWork,
        ILogger<AdjustInventoryCommandHandler> logger)
    {
        _inventoryRepository = inventoryRepository;
        _productRepository = productRepository;
        _adjustmentRepository = adjustmentRepository;
        _mediator = mediator;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<InventoryAdjustmentDto> Handle(AdjustInventoryCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Adjusting inventory for product: {ProductId}, change: {QuantityChange}", 
            request.ProductId, request.QuantityChange);

        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
            throw new InvalidOperationException($"Product with id {request.ProductId} not found");

        var inventoryList = await _inventoryRepository.FindAsync(i => i.ProductId == request.ProductId, cancellationToken);
        var inventory = inventoryList.FirstOrDefault();
        
        if (inventory == null)
            throw new InvalidOperationException($"Inventory not found for product {request.ProductId}");

        var quantityBefore = inventory.QuantityOnHand;

        // Adjust inventory
        if (request.QuantityChange > 0)
        {
            inventory.AddStock(request.QuantityChange);
        }
        else
        {
            inventory.RemoveStock(Math.Abs(request.QuantityChange));
        }

        await _inventoryRepository.UpdateAsync(inventory, cancellationToken);

        // Create adjustment record
        var adjustment = new InventoryAdjustment(
            request.ProductId,
            inventory.Id,
            request.QuantityChange,
            quantityBefore,
            request.AdjustmentType,
            request.AdjustedBy,
            request.Reason,
            request.ReferenceNumber);

        await _adjustmentRepository.AddAsync(adjustment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Raise domain events
        if (request.QuantityChange > 0)
        {
            var stockIncreasedEvent = new StockIncreasedEvent(
                request.ProductId,
                inventory.Id,
                request.QuantityChange,
                inventory.QuantityOnHand,
                request.Reason ?? request.AdjustmentType);

            await _mediator.Publish(stockIncreasedEvent, cancellationToken);
        }
        else
        {
            var stockDecreasedEvent = new StockDecreasedEvent(
                request.ProductId,
                inventory.Id,
                Math.Abs(request.QuantityChange),
                inventory.QuantityOnHand,
                request.Reason ?? request.AdjustmentType);

            await _mediator.Publish(stockDecreasedEvent, cancellationToken);
        }

        // Check for low stock
        if (inventory.IsLowStock(product.LowStockThreshold))
        {
            var lowStockEvent = new LowStockEvent(
                product.Id,
                product.Name,
                product.SKU,
                inventory.AvailableQuantity,
                product.LowStockThreshold);

            await _mediator.Publish(lowStockEvent, cancellationToken);
        }

        _logger.LogInformation("Inventory adjusted successfully for product: {ProductId}", request.ProductId);

        return new InventoryAdjustmentDto
        {
            Id = adjustment.Id,
            ProductId = adjustment.ProductId,
            ProductName = product.Name,
            QuantityChange = adjustment.QuantityChange,
            QuantityBefore = adjustment.QuantityBefore,
            QuantityAfter = adjustment.QuantityAfter,
            AdjustmentType = adjustment.AdjustmentType,
            Reason = adjustment.Reason,
            AdjustedBy = adjustment.AdjustedBy,
            CreatedAt = adjustment.CreatedAt
        };
    }
}

