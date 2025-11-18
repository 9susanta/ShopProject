using MediatR;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Application.Queries.Products;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Print;

public class PrintBarcodeCommandHandler : IRequestHandler<PrintBarcodeCommand, bool>
{
    private readonly IBarcodePrintService _barcodePrintService;
    private readonly IMediator _mediator;
    private readonly ILogger<PrintBarcodeCommandHandler> _logger;

    public PrintBarcodeCommandHandler(
        IBarcodePrintService barcodePrintService,
        IMediator mediator,
        ILogger<PrintBarcodeCommandHandler> logger)
    {
        _barcodePrintService = barcodePrintService;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<bool> Handle(PrintBarcodeCommand request, CancellationToken cancellationToken)
    {
        var productQuery = new GetProductByIdQuery { Id = request.ProductId };
        var product = await _mediator.Send(productQuery, cancellationToken);

        if (product == null)
            throw new KeyNotFoundException($"Product with ID {request.ProductId} not found.");

        if (string.IsNullOrEmpty(product.Barcode))
            throw new InvalidOperationException($"Product {product.Name} does not have a barcode.");

        return await _barcodePrintService.PrintBarcodeAsync(product.Barcode, request.Quantity, cancellationToken);
    }
}

