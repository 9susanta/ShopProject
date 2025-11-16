using MediatR;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using GroceryStoreManagement.Domain.Events;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.EventHandlers;

public class CreateLedgerEntriesHandler : INotificationHandler<PurchaseReceivedEvent>, INotificationHandler<SaleCompletedEvent>
{
    private readonly IRepository<LedgerEntry> _ledgerEntryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateLedgerEntriesHandler> _logger;

    public CreateLedgerEntriesHandler(
        IRepository<LedgerEntry> ledgerEntryRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateLedgerEntriesHandler> logger)
    {
        _ledgerEntryRepository = ledgerEntryRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Handle(PurchaseReceivedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating ledger entry for purchase: {PurchaseOrderId}", notification.PurchaseOrderId);

        var totalAmount = notification.Items.Sum(i => i.Quantity * i.UnitPrice);
        var ledgerEntry = new LedgerEntry(
            LedgerEntryType.Purchase,
            notification.PurchaseOrderId,
            notification.OrderNumber,
            totalAmount,
            $"Purchase order {notification.OrderNumber} received");

        await _ledgerEntryRepository.AddAsync(ledgerEntry, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Ledger entry created for purchase: {PurchaseOrderId}", notification.PurchaseOrderId);
    }

    public async Task Handle(SaleCompletedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating ledger entry for sale: {SaleId}", notification.SaleId);

        var ledgerEntry = new LedgerEntry(
            LedgerEntryType.Sale,
            notification.SaleId,
            notification.InvoiceNumber,
            notification.TotalAmount,
            $"Sale {notification.InvoiceNumber} completed");

        await _ledgerEntryRepository.AddAsync(ledgerEntry, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Ledger entry created for sale: {SaleId}", notification.SaleId);
    }
}

