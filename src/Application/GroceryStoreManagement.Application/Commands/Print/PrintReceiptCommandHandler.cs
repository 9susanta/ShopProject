using MediatR;
using GroceryStoreManagement.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Print;

public class PrintReceiptCommandHandler : IRequestHandler<PrintReceiptCommand, bool>
{
    private readonly IReceiptPrinterService _printerService;
    private readonly ILogger<PrintReceiptCommandHandler> _logger;

    public PrintReceiptCommandHandler(
        IReceiptPrinterService printerService,
        ILogger<PrintReceiptCommandHandler> logger)
    {
        _printerService = printerService;
        _logger = logger;
    }

    public async Task<bool> Handle(PrintReceiptCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Printing receipt for sale {SaleId}", request.SaleId);
        return await _printerService.PrintReceiptAsync(request.SaleId, cancellationToken);
    }
}

