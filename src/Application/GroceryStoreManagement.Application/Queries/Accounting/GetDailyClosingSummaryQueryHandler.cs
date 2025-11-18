using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Queries.Accounting;

public class GetDailyClosingSummaryQueryHandler : IRequestHandler<GetDailyClosingSummaryQuery, DailyClosingSummaryDto>
{
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<PurchaseOrder> _purchaseOrderRepository;
    private readonly IRepository<PayLaterLedger> _payLaterLedgerRepository;

    public GetDailyClosingSummaryQueryHandler(
        IRepository<Sale> saleRepository,
        IRepository<PurchaseOrder> purchaseOrderRepository,
        IRepository<PayLaterLedger> payLaterLedgerRepository)
    {
        _saleRepository = saleRepository;
        _purchaseOrderRepository = purchaseOrderRepository;
        _payLaterLedgerRepository = payLaterLedgerRepository;
    }

    public async Task<DailyClosingSummaryDto> Handle(GetDailyClosingSummaryQuery request, CancellationToken cancellationToken)
    {
        var startDate = request.Date.Date;
        var endDate = startDate.AddDays(1);

        // Get all sales for the day
        var allSales = await _saleRepository.GetAllAsync(cancellationToken);
        var sales = allSales
            .Where(s => s.SaleDate >= startDate && s.SaleDate < endDate && s.Status == SaleStatus.Completed)
            .ToList();

        // Get all purchase orders for the day
        var allPOs = await _purchaseOrderRepository.GetAllAsync(cancellationToken);
        var purchaseOrders = allPOs
            .Where(po => po.OrderDate >= startDate && po.OrderDate < endDate && po.Status == PurchaseOrderStatus.Received)
            .ToList();

        // Get pay later payments for the day
        var allLedgers = await _payLaterLedgerRepository.GetAllAsync(cancellationToken);
        var payLaterPayments = allLedgers
            .Where(l => l.CreatedAt >= startDate && l.CreatedAt < endDate && l.TransactionType == "Payment")
            .ToList();

        var summary = new DailyClosingSummaryDto
        {
            Date = request.Date,
            TotalSales = sales.Sum(s => s.TotalAmount),
            TotalPurchases = purchaseOrders.Sum(po => po.TotalAmount),
            TotalPayLaterPayments = payLaterPayments.Sum(p => p.Amount),
            TotalGSTCollected = sales.Sum(s => s.TotalGSTAmount),
            TotalGSTPaid = 0, // GST on purchases would need to be calculated from product tax slabs
            NetCash = sales.Sum(s => s.CashAmount),
            NetUPI = sales.Sum(s => s.UPIAmount),
            NetCard = sales.Sum(s => s.CardAmount),
            NetPayLater = sales.Sum(s => s.PayLaterAmount) - payLaterPayments.Sum(p => p.Amount),
            TotalTransactions = sales.Count,
            TotalCustomers = sales.Select(s => s.CustomerId).Where(id => id.HasValue).Distinct().Count(),
        };

        // Build ledger entries
        var entries = new List<AccountingLedgerEntryDto>();

        // Sales entries
        foreach (var sale in sales)
        {
            entries.Add(new AccountingLedgerEntryDto
            {
                Id = sale.Id,
                EntryType = "Sale",
                EntryDate = sale.SaleDate,
                Amount = sale.TotalAmount,
                Reference = sale.InvoiceNumber,
                ReferenceId = sale.Id,
                Description = $"Sale: {sale.InvoiceNumber}",
                GSTAmount = sale.TotalGSTAmount,
                CGSTAmount = sale.TotalGSTAmount / 2,
                SGSTAmount = sale.TotalGSTAmount / 2,
                CustomerName = sale.Customer?.Name,
                CreatedAt = sale.CreatedAt,
            });
        }

        // Purchase entries
        foreach (var po in purchaseOrders)
        {
            entries.Add(new AccountingLedgerEntryDto
            {
                Id = po.Id,
                EntryType = "Purchase",
                EntryDate = po.OrderDate,
                Amount = po.TotalAmount,
                Reference = po.OrderNumber,
                ReferenceId = po.Id,
                Description = $"Purchase Order: {po.OrderNumber}",
                GSTAmount = 0, // GST on purchases would need to be calculated from product tax slabs
                CGSTAmount = 0,
                SGSTAmount = 0,
                SupplierName = po.Supplier?.Name,
                CreatedAt = po.CreatedAt,
            });
        }

        // Pay later payment entries
        foreach (var payment in payLaterPayments)
        {
            entries.Add(new AccountingLedgerEntryDto
            {
                Id = payment.Id,
                EntryType = "PayLaterPayment",
                EntryDate = payment.CreatedAt,
                Amount = payment.Amount,
                Reference = payment.Sale?.InvoiceNumber,
                ReferenceId = payment.SaleId,
                Description = payment.Description ?? "Pay Later Payment",
                CustomerName = payment.Customer?.Name,
                CreatedAt = payment.CreatedAt,
            });
        }

        summary.Entries = entries.OrderBy(e => e.EntryDate).ToList();

        return summary;
    }
}

