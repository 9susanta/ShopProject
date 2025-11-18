using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Suppliers;

public class GetOutstandingPaymentsQueryHandler : IRequestHandler<GetOutstandingPaymentsQuery, List<OutstandingPaymentDto>>
{
    private readonly IRepository<Supplier> _supplierRepository;
    private readonly IRepository<PurchaseOrder> _poRepository;
    private readonly IRepository<GoodsReceiveNote> _grnRepository;
    private readonly IRepository<SupplierPayment> _paymentRepository;
    private readonly ILogger<GetOutstandingPaymentsQueryHandler> _logger;

    public GetOutstandingPaymentsQueryHandler(
        IRepository<Supplier> supplierRepository,
        IRepository<PurchaseOrder> poRepository,
        IRepository<GoodsReceiveNote> grnRepository,
        IRepository<SupplierPayment> paymentRepository,
        ILogger<GetOutstandingPaymentsQueryHandler> logger)
    {
        _supplierRepository = supplierRepository;
        _poRepository = poRepository;
        _grnRepository = grnRepository;
        _paymentRepository = paymentRepository;
        _logger = logger;
    }

    public async Task<List<OutstandingPaymentDto>> Handle(GetOutstandingPaymentsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving outstanding payments for supplier: {SupplierId}", request.SupplierId);

        var suppliers = await _supplierRepository.GetAllAsync(cancellationToken);
        var filteredSuppliers = request.SupplierId.HasValue
            ? suppliers.Where(s => s.Id == request.SupplierId.Value).ToList()
            : suppliers.ToList();

        var result = new List<OutstandingPaymentDto>();

        foreach (var supplier in filteredSuppliers)
        {
            // Get all GRNs for this supplier
            var grns = (await _grnRepository.FindAsync(g => g.SupplierId == supplier.Id, cancellationToken)).ToList();
            
            // Get all payments for this supplier
            var payments = (await _paymentRepository.FindAsync(p => p.SupplierId == supplier.Id, cancellationToken)).ToList();

            // Calculate total GRN amount (assuming GRN has TotalAmount property)
            var totalGRNAmount = grns.Sum(g => g.TotalAmount);
            var totalPaid = payments.Sum(p => p.Amount);
            var outstanding = totalGRNAmount - totalPaid;

            if (outstanding > 0)
            {
                var unpaidGRNs = grns.Where(g => 
                {
                    var grnPayments = payments.Where(p => p.GRNId == g.Id).Sum(p => p.Amount);
                    return g.TotalAmount > grnPayments;
                }).Count();

                var unpaidPOs = 0; // Calculate if needed based on PO status

                var lastPayment = payments.OrderByDescending(p => p.PaymentDate).FirstOrDefault();

                result.Add(new OutstandingPaymentDto
                {
                    SupplierId = supplier.Id,
                    SupplierName = supplier.Name,
                    TotalOutstanding = outstanding,
                    UnpaidOrders = unpaidPOs,
                    UnpaidGRNs = unpaidGRNs,
                    LastPaymentDate = lastPayment?.PaymentDate
                });
            }
        }

        return result.OrderByDescending(r => r.TotalOutstanding).ToList();
    }
}

