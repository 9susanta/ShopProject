using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Suppliers;

public class CreateSupplierPaymentCommandHandler : IRequestHandler<CreateSupplierPaymentCommand, SupplierPaymentDto>
{
    private readonly IRepository<SupplierPayment> _paymentRepository;
    private readonly IRepository<Supplier> _supplierRepository;
    private readonly IRepository<PurchaseOrder> _poRepository;
    private readonly IRepository<GoodsReceiveNote> _grnRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateSupplierPaymentCommandHandler> _logger;

    public CreateSupplierPaymentCommandHandler(
        IRepository<SupplierPayment> paymentRepository,
        IRepository<Supplier> supplierRepository,
        IRepository<PurchaseOrder> poRepository,
        IRepository<GoodsReceiveNote> grnRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateSupplierPaymentCommandHandler> logger)
    {
        _paymentRepository = paymentRepository;
        _supplierRepository = supplierRepository;
        _poRepository = poRepository;
        _grnRepository = grnRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<SupplierPaymentDto> Handle(CreateSupplierPaymentCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating payment for supplier: {SupplierId}, Amount: {Amount}", request.SupplierId, request.Amount);

        var supplier = await _supplierRepository.GetByIdAsync(request.SupplierId, cancellationToken);
        if (supplier == null)
            throw new KeyNotFoundException($"Supplier with ID {request.SupplierId} not found.");

        if (request.Amount <= 0)
            throw new ArgumentException("Payment amount must be greater than zero.");

        // Validate PO/GRN if provided
        PurchaseOrder? po = null;
        if (request.PurchaseOrderId.HasValue)
        {
            po = await _poRepository.GetByIdAsync(request.PurchaseOrderId.Value, cancellationToken);
            if (po == null)
                throw new KeyNotFoundException($"Purchase Order with ID {request.PurchaseOrderId.Value} not found.");
            if (po.SupplierId != request.SupplierId)
                throw new InvalidOperationException($"Purchase Order {request.PurchaseOrderId.Value} does not belong to supplier {request.SupplierId}.");
        }

        GoodsReceiveNote? grn = null;
        if (request.GRNId.HasValue)
        {
            grn = await _grnRepository.GetByIdAsync(request.GRNId.Value, cancellationToken);
            if (grn == null)
                throw new KeyNotFoundException($"GRN with ID {request.GRNId.Value} not found.");
            if (grn.SupplierId != request.SupplierId)
                throw new InvalidOperationException($"GRN {request.GRNId.Value} does not belong to supplier {request.SupplierId}.");
        }

        // TODO: Get current user ID from context
        var currentUserId = Guid.Empty; // Replace with actual user ID from authentication context

        var payment = new SupplierPayment(
            request.SupplierId,
            request.Amount,
            request.PaymentMethod,
            request.PaymentDate,
            currentUserId,
            request.PurchaseOrderId,
            request.GRNId,
            request.ReferenceNumber,
            request.Notes);

        await _paymentRepository.AddAsync(payment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment created: {PaymentId} for supplier {SupplierId}", payment.Id, request.SupplierId);

        return await MapToDtoAsync(payment, supplier, po, grn, cancellationToken);
    }

    private async Task<SupplierPaymentDto> MapToDtoAsync(
        SupplierPayment payment,
        Supplier supplier,
        PurchaseOrder? po,
        GoodsReceiveNote? grn,
        CancellationToken cancellationToken)
    {
        return new SupplierPaymentDto
        {
            Id = payment.Id,
            SupplierId = payment.SupplierId,
            SupplierName = supplier.Name,
            PurchaseOrderId = payment.PurchaseOrderId,
            PurchaseOrderNumber = po?.OrderNumber,
            GRNId = payment.GRNId,
            GRNNumber = grn?.GRNNumber,
            Amount = payment.Amount,
            PaymentMethod = payment.PaymentMethod,
            PaymentDate = payment.PaymentDate,
            ReferenceNumber = payment.ReferenceNumber,
            Notes = payment.Notes,
            CreatedBy = payment.CreatedBy,
            CreatedAt = payment.CreatedAt
        };
    }
}

