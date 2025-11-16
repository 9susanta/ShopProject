using System.Data;
using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Events;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Commands.Sales;

public class CreateSaleCommandHandler : IRequestHandler<CreateSaleCommand, SaleDto>
{
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<Customer> _customerRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateSaleCommandHandler> _logger;

    public CreateSaleCommandHandler(
        IRepository<Sale> saleRepository,
        IRepository<Customer> customerRepository,
        IRepository<Product> productRepository,
        IRepository<InventoryEntity> inventoryRepository,
        IMediator mediator,
        IUnitOfWork unitOfWork,
        ILogger<CreateSaleCommandHandler> logger)
    {
        _saleRepository = saleRepository;
        _customerRepository = customerRepository;
        _productRepository = productRepository;
        _inventoryRepository = inventoryRepository;
        _mediator = mediator;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<SaleDto> Handle(CreateSaleCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating sale: {InvoiceNumber}", request.InvoiceNumber);

        // Use transaction with serializable isolation to prevent inventory race conditions
        await _unitOfWork.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, cancellationToken);
        
        try
        {
            Customer? customer = null;
            if (request.CustomerId.HasValue)
            {
                customer = await _customerRepository.GetByIdAsync(request.CustomerId.Value, cancellationToken);
                if (customer == null)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    throw new InvalidOperationException($"Customer with id {request.CustomerId} not found");
                }
            }

            var sale = new Sale(request.InvoiceNumber, request.CustomerId, discountAmount: request.DiscountAmount);

            // Process items and validate inventory within transaction
            var inventoryChecks = new List<(InventoryEntity inventory, int quantity)>();

            // Validate products and check inventory
            foreach (var item in request.Items)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId, cancellationToken);
                if (product == null)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    throw new InvalidOperationException($"Product with id {item.ProductId} not found");
                }

                // Check inventory within transaction (prevents race condition)
                var inventoryList = await _inventoryRepository.FindAsync(i => i.ProductId == item.ProductId, cancellationToken);
                var inv = inventoryList.FirstOrDefault();
                if (inv == null || inv.AvailableQuantity < item.Quantity)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    throw new InvalidOperationException($"Insufficient stock for product {product.Name}. Available: {inv?.AvailableQuantity ?? 0}, Requested: {item.Quantity}");
                }

                // Store inventory check for later reduction
                inventoryChecks.Add((inv, item.Quantity));

                sale.AddItem(item.ProductId, item.Quantity, item.UnitPrice);
            }

            sale.Complete();

            await _saleRepository.AddAsync(sale, cancellationToken);

            // Create invoice
            var invoice = new Invoice(
                sale.Id,
                sale.InvoiceNumber,
                sale.SubTotal,
                sale.TotalGSTAmount,
                sale.DiscountAmount,
                sale.TotalAmount);

            // Reduce inventory atomically within transaction (prevents race condition)
            foreach (var (inventory, quantity) in inventoryChecks)
            {
                // Re-check inventory right before reduction (double-check pattern)
                if (inventory.AvailableQuantity < quantity)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    throw new InvalidOperationException($"Insufficient stock. Available: {inventory.AvailableQuantity}, Requested: {quantity}");
                }
                
                inventory.RemoveStock(quantity);
                await _inventoryRepository.UpdateAsync(inventory, cancellationToken);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            // Raise domain events (inventory already reduced in transaction above)
            // Note: UpdateStockOnSaleCompletedHandler will still run but should be idempotent
            var items = sale.Items.Select(i => new SaleCompletedEvent.SaleItem(i.ProductId, i.Quantity, i.UnitPrice)).ToList();
            var saleCompletedEvent = new SaleCompletedEvent(
                sale.Id,
                sale.InvoiceNumber,
                sale.SaleDate,
                sale.TotalAmount,
                items);

            await _mediator.Publish(saleCompletedEvent, cancellationToken);

            _logger.LogInformation("Sale created successfully: {SaleId}", sale.Id);

            return new SaleDto
            {
                Id = sale.Id,
                InvoiceNumber = sale.InvoiceNumber,
                CustomerId = sale.CustomerId,
                CustomerName = customer?.Name,
                Status = sale.Status.ToString(),
                SaleDate = sale.SaleDate,
                SubTotal = sale.SubTotal,
                TaxAmount = sale.TotalGSTAmount,
                DiscountAmount = sale.DiscountAmount,
                TotalAmount = sale.TotalAmount,
                Items = sale.Items.Select(i => new SaleItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.TotalPrice
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            _logger.LogError(ex, "Error creating sale: {InvoiceNumber}", request.InvoiceNumber);
            throw;
        }
    }
}

