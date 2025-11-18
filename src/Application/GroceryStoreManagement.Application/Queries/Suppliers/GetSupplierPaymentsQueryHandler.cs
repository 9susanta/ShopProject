using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Suppliers;

public class GetSupplierPaymentsQueryHandler : IRequestHandler<GetSupplierPaymentsQuery, List<SupplierPaymentDto>>
{
    private readonly IRepository<SupplierPayment> _paymentRepository;
    private readonly IRepository<Supplier> _supplierRepository;
    private readonly IRepository<PurchaseOrder> _poRepository;
    private readonly IRepository<GoodsReceiveNote> _grnRepository;
    private readonly ILogger<GetSupplierPaymentsQueryHandler> _logger;

    public GetSupplierPaymentsQueryHandler(
        IRepository<SupplierPayment> paymentRepository,
        IRepository<Supplier> supplierRepository,
        IRepository<PurchaseOrder> poRepository,
        IRepository<GoodsReceiveNote> grnRepository,
        ILogger<GetSupplierPaymentsQueryHandler> logger)
    {
        _paymentRepository = paymentRepository;
        _supplierRepository = supplierRepository;
        _poRepository = poRepository;
        _grnRepository = grnRepository;
        _logger = logger;
    }

    public async Task<List<SupplierPaymentDto>> Handle(GetSupplierPaymentsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving payments for supplier: {SupplierId}", request.SupplierId);

        var payments = await _paymentRepository.GetAllAsync(cancellationToken);
        var filteredPayments = payments
            .Where(p => p.SupplierId == request.SupplierId)
            .AsQueryable();

        if (request.StartDate.HasValue)
        {
            filteredPayments = filteredPayments.Where(p => p.PaymentDate >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            filteredPayments = filteredPayments.Where(p => p.PaymentDate <= request.EndDate.Value);
        }

        var paymentList = filteredPayments
            .OrderByDescending(p => p.PaymentDate)
            .ToList();

        // Load related data
        var supplier = await _supplierRepository.GetByIdAsync(request.SupplierId, cancellationToken);
        if (supplier == null)
            return new List<SupplierPaymentDto>();

        var poIds = paymentList.Where(p => p.PurchaseOrderId.HasValue).Select(p => p.PurchaseOrderId!.Value).Distinct().ToList();
        var pos = poIds.Any()
            ? (await _poRepository.FindAsync(po => poIds.Contains(po.Id), cancellationToken)).ToList()
            : new List<PurchaseOrder>();
        var poLookup = pos.ToDictionary(po => po.Id);

        var grnIds = paymentList.Where(p => p.GRNId.HasValue).Select(p => p.GRNId!.Value).Distinct().ToList();
        var grns = grnIds.Any()
            ? (await _grnRepository.FindAsync(grn => grnIds.Contains(grn.Id), cancellationToken)).ToList()
            : new List<GoodsReceiveNote>();
        var grnLookup = grns.ToDictionary(grn => grn.Id);

        return paymentList.Select(p => new SupplierPaymentDto
        {
            Id = p.Id,
            SupplierId = p.SupplierId,
            SupplierName = supplier.Name,
            PurchaseOrderId = p.PurchaseOrderId,
            PurchaseOrderNumber = poLookup.GetValueOrDefault(p.PurchaseOrderId ?? Guid.Empty)?.OrderNumber,
            GRNId = p.GRNId,
            GRNNumber = grnLookup.GetValueOrDefault(p.GRNId ?? Guid.Empty)?.GRNNumber,
            Amount = p.Amount,
            PaymentMethod = p.PaymentMethod,
            PaymentDate = p.PaymentDate,
            ReferenceNumber = p.ReferenceNumber,
            Notes = p.Notes,
            CreatedBy = p.CreatedBy,
            CreatedAt = p.CreatedAt
        }).ToList();
    }
}

