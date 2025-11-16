using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Purchases;

public class CreateGRNCommandHandler : IRequestHandler<CreateGRNCommand, GRNDto>
{
    private readonly IRepository<GoodsReceiveNote> _grnRepository;
    private readonly IRepository<Supplier> _supplierRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<PurchaseOrder> _purchaseOrderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateGRNCommandHandler> _logger;

    public CreateGRNCommandHandler(
        IRepository<GoodsReceiveNote> grnRepository,
        IRepository<Supplier> supplierRepository,
        IRepository<Product> productRepository,
        IRepository<PurchaseOrder> purchaseOrderRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateGRNCommandHandler> logger)
    {
        _grnRepository = grnRepository;
        _supplierRepository = supplierRepository;
        _productRepository = productRepository;
        _purchaseOrderRepository = purchaseOrderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<GRNDto> Handle(CreateGRNCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating GRN: {GRNNumber}", request.GRNNumber);

        // Check idempotency if key provided
        if (!string.IsNullOrWhiteSpace(request.IdempotencyKey))
        {
            var existingGRN = (await _grnRepository.FindAsync(
                g => g.IdempotencyKey == request.IdempotencyKey, cancellationToken)).FirstOrDefault();
            
            if (existingGRN != null)
            {
                _logger.LogInformation("GRN already exists with idempotency key: {IdempotencyKey}", request.IdempotencyKey);
                return MapToDto(existingGRN);
            }
        }

        // Validate supplier
        var supplier = await _supplierRepository.GetByIdAsync(request.SupplierId, cancellationToken);
        if (supplier == null)
            throw new InvalidOperationException($"Supplier with ID '{request.SupplierId}' not found.");

        // Validate purchase order if provided
        if (request.PurchaseOrderId.HasValue)
        {
            var purchaseOrder = await _purchaseOrderRepository.GetByIdAsync(request.PurchaseOrderId.Value, cancellationToken);
            if (purchaseOrder == null)
                throw new InvalidOperationException($"Purchase order with ID '{request.PurchaseOrderId.Value}' not found.");
        }

        // Validate products
        foreach (var item in request.Items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId, cancellationToken);
            if (product == null)
                throw new InvalidOperationException($"Product with ID '{item.ProductId}' not found.");
        }

        // Create GRN
        var grn = new GoodsReceiveNote(
            request.GRNNumber,
            request.SupplierId,
            request.ReceivedDate,
            request.PurchaseOrderId,
            request.InvoiceNumber,
            request.InvoiceFilePath,
            request.Notes,
            request.IdempotencyKey);

        // Add items
        foreach (var item in request.Items)
        {
            grn.AddItem(item.ProductId, item.Quantity, item.UnitCost, item.ExpiryDate, item.BatchNumber);
        }

        await _grnRepository.AddAsync(grn, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("GRN created successfully: {GRNId}", grn.Id);

        return MapToDto(grn);
    }

    private GRNDto MapToDto(GoodsReceiveNote grn)
    {
        return new GRNDto
        {
            Id = grn.Id,
            GRNNumber = grn.GRNNumber,
            SupplierId = grn.SupplierId,
            PurchaseOrderId = grn.PurchaseOrderId,
            Status = grn.Status.ToString(),
            ReceivedDate = grn.ReceivedDate,
            InvoiceNumber = grn.InvoiceNumber,
            InvoiceFilePath = grn.InvoiceFilePath,
            TotalAmount = grn.TotalAmount,
            Notes = grn.Notes,
            IdempotencyKey = grn.IdempotencyKey,
            CreatedAt = grn.CreatedAt,
            UpdatedAt = grn.UpdatedAt,
            Items = grn.Items.Select(i => new GRNItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitCost = i.UnitCost,
                TotalCost = i.TotalCost,
                ExpiryDate = i.ExpiryDate,
                BatchNumber = i.BatchNumber
            }).ToList()
        };
    }
}

