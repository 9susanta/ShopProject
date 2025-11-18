using GroceryStoreManagement.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.IO.Ports;
using ZXing;
using ZXing.Common;

namespace GroceryStoreManagement.Infrastructure.Services;

public class BarcodePrintService : IBarcodePrintService, IDisposable
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<BarcodePrintService> _logger;
    private SerialPort? _serialPort;
    private bool _disposed = false;

    public BarcodePrintService(IConfiguration configuration, ILogger<BarcodePrintService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<byte[]> GenerateBarcodeImageAsync(string barcode, int width = 200, int height = 100, CancellationToken cancellationToken = default)
    {
        try
        {
            var writer = new BarcodeWriterPixelData
            {
                Format = BarcodeFormat.CODE_128,
                Options = new EncodingOptions
                {
                    Height = height,
                    Width = width,
                    Margin = 2
                }
            };

            var pixelData = writer.Write(barcode);
            // Return pixel data as PNG bytes (simplified - actual implementation would convert to PNG)
            // For now, return a placeholder - actual PNG conversion would require System.Drawing or SkiaSharp
            _logger.LogInformation("Generated barcode image for {Barcode}", barcode);
            return new byte[0]; // TODO: Convert pixelData to PNG bytes
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate barcode image for {Barcode}", barcode);
            throw;
        }
    }

    public async Task<bool> PrintBarcodeAsync(string barcode, int quantity = 1, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_serialPort?.IsOpen != true)
            {
                var port = _configuration["BarcodePrinter:Port"] ?? "COM3";
                var baudRate = int.Parse(_configuration["BarcodePrinter:BaudRate"] ?? "9600");

                _serialPort = new SerialPort(port, baudRate, Parity.None, 8, StopBits.One)
                {
                    ReadTimeout = 1000,
                    WriteTimeout = 1000
                };
                _serialPort.Open();
            }

            // Generate barcode image
            var barcodeImage = await GenerateBarcodeImageAsync(barcode, cancellationToken: cancellationToken);

            // Send ESC/POS commands to print barcode
            for (int i = 0; i < quantity; i++)
            {
                _serialPort!.Write("\x1B\x40"); // Initialize
                _serialPort.Write($"\x1D\x6B\x04{barcode}\x00"); // Print barcode
                _serialPort.Write("\n\n"); // Feed paper
            }

            _logger.LogInformation("Printed {Quantity} barcode(s) for {Barcode}", quantity, barcode);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to print barcode {Barcode}", barcode);
            return false;
        }
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            _serialPort?.Dispose();
            _disposed = true;
        }
    }
}

