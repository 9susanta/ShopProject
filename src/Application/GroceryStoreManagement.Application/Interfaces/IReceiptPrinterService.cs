namespace GroceryStoreManagement.Application.Interfaces;

public interface IReceiptPrinterService
{
    Task<bool> PrintReceiptAsync(Guid saleId, CancellationToken cancellationToken = default);
    Task<bool> IsPrinterConnectedAsync(CancellationToken cancellationToken = default);
    Task<bool> ConnectAsync(string? printerName = null, CancellationToken cancellationToken = default);
    Task DisconnectAsync(CancellationToken cancellationToken = default);
}

