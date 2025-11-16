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

        Customer? customer = null;
        if (request.CustomerId.HasValue)
        {
            customer = await _customerRepository.GetByIdAsync(request.CustomerId.Value, cancellationToken);
            if (customer == null)
                throw new InvalidOperationException($"Customer with id {request.CustomerId} not found");
        }

        var sale = new Sale(request.InvoiceNumber, request.CustomerId, discountAmount: request.DiscountAmount);

        // Validate products and check inventory
        foreach (var item in request.Items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId, cancellationToken);
            if (product == null)
                throw new InvalidOperationException($"Product with id {item.ProductId} not found");

            var inventory = await _inventoryRepository.FindAsync(i => i.ProductId == item.ProductId, cancellationToken);
            var inv = inventory.FirstOrDefault();
            if (inv == null || inv.AvailableQuantity < item.Quantity)
                throw new InvalidOperationException($"Insufficient stock for product {product.Name}. Available: {inv?.AvailableQuantity ?? 0}, Requested: {item.Quantity}");

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

        // Note: Invoice repository would be needed, but for now we'll skip it

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Raise domain event
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
}

