using MediatR;

namespace GroceryStoreManagement.Application.Commands.Print;

public class PrintBarcodeCommand : IRequest<bool>
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; } = 1;
}

