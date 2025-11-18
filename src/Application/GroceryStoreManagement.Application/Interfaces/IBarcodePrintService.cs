namespace GroceryStoreManagement.Application.Interfaces;

public interface IBarcodePrintService
{
    Task<byte[]> GenerateBarcodeImageAsync(string barcode, int width = 200, int height = 100, CancellationToken cancellationToken = default);
    Task<bool> PrintBarcodeAsync(string barcode, int quantity = 1, CancellationToken cancellationToken = default);
}

