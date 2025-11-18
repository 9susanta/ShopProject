using MediatR;

namespace GroceryStoreManagement.Application.Commands.Print;

public class PrintReceiptCommand : IRequest<bool>
{
    public Guid SaleId { get; set; }
}

