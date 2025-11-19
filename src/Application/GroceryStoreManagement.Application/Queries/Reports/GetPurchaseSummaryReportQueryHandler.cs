using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Queries.Reports;

public class GetPurchaseSummaryReportQueryHandler : IRequestHandler<GetPurchaseSummaryReportQuery, PurchaseSummaryReportDto>
{
    private readonly IRepository<PurchaseOrder> _purchaseOrderRepository;
    private readonly IRepository<GoodsReceiveNote> _grnRepository;
    private readonly IRepository<SupplierPayment> _supplierPaymentRepository;
    private readonly IRepository<Supplier> _supplierRepository;

    public GetPurchaseSummaryReportQueryHandler(
        IRepository<PurchaseOrder> purchaseOrderRepository,
        IRepository<GoodsReceiveNote> grnRepository,
        IRepository<SupplierPayment> supplierPaymentRepository,
        IRepository<Supplier> supplierRepository)
    {
        _purchaseOrderRepository = purchaseOrderRepository;
        _grnRepository = grnRepository;
        _supplierPaymentRepository = supplierPaymentRepository;
        _supplierRepository = supplierRepository;
    }

    public async Task<PurchaseSummaryReportDto> Handle(GetPurchaseSummaryReportQuery request, CancellationToken cancellationToken)
    {
        var startDate = request.StartDate?.Date ?? DateTime.Today.AddDays(-30);
        var endDate = request.EndDate?.Date.AddDays(1) ?? DateTime.Today.AddDays(1);

        // Get all purchase orders in date range
        var allPurchaseOrders = await _purchaseOrderRepository.GetAllAsync(cancellationToken);
        var purchaseOrders = allPurchaseOrders
            .Where(po => po.OrderDate >= startDate && po.OrderDate < endDate)
            .ToList();

        // Get all GRNs in date range
        var allGRNs = await _grnRepository.GetAllAsync(cancellationToken);
        var grns = allGRNs
            .Where(grn => grn.ReceivedDate >= startDate && grn.ReceivedDate < endDate && grn.Status == GRNStatus.Confirmed)
            .ToList();

        // Get all supplier payments in date range
        var allPayments = await _supplierPaymentRepository.GetAllAsync(cancellationToken);
        var payments = allPayments
            .Where(p => p.PaymentDate >= startDate && p.PaymentDate < endDate)
            .ToList();

        // Get suppliers for lookup
        var supplierIds = purchaseOrders.Select(po => po.SupplierId).Distinct().ToList();
        var suppliers = (await _supplierRepository.FindAsync(s => supplierIds.Contains(s.Id), cancellationToken)).ToList();
        var supplierLookup = suppliers.ToDictionary(s => s.Id);

        // Calculate totals
        var totalPurchaseOrders = purchaseOrders.Count;
        var totalGRNs = grns.Count;
        var totalPurchaseAmount = purchaseOrders.Sum(po => po.TotalAmount);
        var totalPaidAmount = payments.Sum(p => p.Amount);
        var totalPendingAmount = totalPurchaseAmount - totalPaidAmount;
        var totalItemsPurchased = grns.Sum(grn => grn.Items.Count);

        // Build purchase details list
        var purchases = purchaseOrders.Select(po =>
        {
            var supplier = supplierLookup.GetValueOrDefault(po.SupplierId);
            var poPayments = payments.Where(p => p.PurchaseOrderId == po.Id).Sum(p => p.Amount);
            var paidAmount = poPayments;
            var pendingAmount = po.TotalAmount - paidAmount;

            return new PurchaseSummaryItemDto
            {
                Date = po.OrderDate,
                PurchaseOrderNumber = po.OrderNumber,
                SupplierName = supplier?.Name ?? "Unknown",
                TotalAmount = po.TotalAmount,
                PaidAmount = paidAmount,
                PendingAmount = pendingAmount,
                Status = po.Status.ToString()
            };
        }).OrderByDescending(p => p.Date).ToList();

        return new PurchaseSummaryReportDto
        {
            StartDate = startDate,
            EndDate = endDate.AddDays(-1),
            TotalPurchaseOrders = totalPurchaseOrders,
            TotalGRNs = totalGRNs,
            TotalPurchaseAmount = totalPurchaseAmount,
            TotalPaidAmount = totalPaidAmount,
            TotalPendingAmount = totalPendingAmount,
            TotalItemsPurchased = totalItemsPurchased,
            Purchases = purchases
        };
    }
}

