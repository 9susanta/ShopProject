using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Customers;

public class RecordPayLaterPaymentCommand : IRequest<PayLaterLedgerEntryDto>
{
    public Guid CustomerId { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public string? PaymentReference { get; set; } // UPI reference, cheque number, etc.
}

