using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Commands.Customers;

public class RecordPayLaterPaymentCommandHandler : IRequestHandler<RecordPayLaterPaymentCommand, PayLaterLedgerEntryDto>
{
    private readonly IRepository<Customer> _customerRepository;
    private readonly IRepository<PayLaterLedger> _payLaterLedgerRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RecordPayLaterPaymentCommandHandler(
        IRepository<Customer> customerRepository,
        IRepository<PayLaterLedger> payLaterLedgerRepository,
        IUnitOfWork unitOfWork)
    {
        _customerRepository = customerRepository;
        _payLaterLedgerRepository = payLaterLedgerRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PayLaterLedgerEntryDto> Handle(RecordPayLaterPaymentCommand request, CancellationToken cancellationToken)
    {
        var customer = await _customerRepository.GetByIdAsync(request.CustomerId, cancellationToken);
        if (customer == null)
            throw new InvalidOperationException($"Customer with ID {request.CustomerId} not found");

        if (request.Amount <= 0)
            throw new ArgumentException("Payment amount must be greater than zero", nameof(request.Amount));

        if (customer.PayLaterBalance < request.Amount)
            throw new InvalidOperationException($"Payment amount ({request.Amount}) exceeds balance ({customer.PayLaterBalance})");

        // Reduce customer balance
        customer.ReducePayLaterBalance(request.Amount);

        // Create ledger entry
        var ledgerEntry = new PayLaterLedger(
            customer.Id,
            "Payment",
            request.Amount,
            customer.PayLaterBalance,
            null,
            request.Description ?? $"Payment: {request.PaymentReference ?? "Cash"}");

        await _payLaterLedgerRepository.AddAsync(ledgerEntry, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new PayLaterLedgerEntryDto
        {
            Id = ledgerEntry.Id,
            CustomerId = customer.Id,
            CustomerName = customer.Name,
            TransactionType = "Payment",
            Amount = ledgerEntry.Amount,
            BalanceAfter = ledgerEntry.BalanceAfter,
            SaleId = ledgerEntry.SaleId,
            SaleInvoiceNumber = null,
            Description = ledgerEntry.Description,
            CreatedAt = ledgerEntry.CreatedAt
        };
    }
}

