using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Queries.Sales;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text;

namespace GroceryStoreManagement.Infrastructure.Services;

public class ReceiptPrinterService : IReceiptPrinterService, IDisposable
{
    private readonly IMediator _mediator;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ReceiptPrinterService> _logger;
    private System.IO.Ports.SerialPort? _serialPort;
    private bool _disposed = false;

    public ReceiptPrinterService(
        IMediator mediator,
        IConfiguration configuration,
        ILogger<ReceiptPrinterService> logger)
    {
        _mediator = mediator;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> ConnectAsync(string? printerName = null, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_serialPort?.IsOpen == true)
            {
                return true;
            }

            var port = printerName ?? _configuration["ReceiptPrinter:Port"] ?? "COM2";
            var baudRate = int.Parse(_configuration["ReceiptPrinter:BaudRate"] ?? "9600");

            _serialPort = new System.IO.Ports.SerialPort(port, baudRate, System.IO.Ports.Parity.None, 8, System.IO.Ports.StopBits.One)
            {
                ReadTimeout = 1000,
                WriteTimeout = 1000
            };

            _serialPort.Open();
            _logger.LogInformation("Receipt printer connected on port {Port}", port);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to receipt printer on port {Port}", printerName);
            return false;
        }
    }

    public async Task<bool> PrintReceiptAsync(Guid saleId, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get sale details
            var saleQuery = new GetSaleByIdQuery { Id = saleId };
            var sale = await _mediator.Send(saleQuery, cancellationToken);
            
            if (sale == null)
            {
                _logger.LogWarning("Sale {SaleId} not found for printing", saleId);
                return false;
            }

            // Ensure printer is connected
            if (_serialPort?.IsOpen != true)
            {
                var connected = await ConnectAsync(cancellationToken: cancellationToken);
                if (!connected)
                {
                    _logger.LogError("Printer is not connected");
                    return false;
                }
            }

            // Generate ESC/POS receipt
            var receiptData = GenerateEscPosReceipt(sale);
            
            // Send to printer (Write expects string)
            _serialPort!.Write(receiptData);
            
            // Cut paper
            _serialPort.Write("\x1D\x56\x00"); // ESC/POS cut command
            
            _logger.LogInformation("Receipt printed for sale {SaleId}", saleId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to print receipt for sale {SaleId}", saleId);
            return false;
        }
    }

    private string GenerateEscPosReceipt(SaleDto sale)
    {
        var sb = new StringBuilder();
        
        // Initialize printer
        sb.Append("\x1B\x40"); // ESC @ (Initialize)
        
        // Center align and double size
        sb.Append("\x1B\x61\x01"); // ESC a 1 (Center align)
        sb.Append("\x1D\x21\x11"); // GS ! 11 (Double width and height)
        sb.Append("GROCERY STORE\n");
        sb.Append("\x1D\x21\x00"); // GS ! 00 (Normal size)
        sb.Append("\x1B\x61\x00"); // ESC a 0 (Left align)
        
        // Store info
        sb.Append("123 Main Street\n");
        sb.Append("City, State 12345\n");
        sb.Append("Phone: (555) 123-4567\n");
        sb.Append("--------------------------------\n");
        
        // Sale info
        sb.Append($"Invoice: {sale.InvoiceNumber}\n");
        sb.Append($"Date: {sale.SaleDate:yyyy-MM-dd HH:mm:ss}\n");
        if (!string.IsNullOrEmpty(sale.CustomerName))
        {
            sb.Append($"Customer: {sale.CustomerName}\n");
        }
        if (!string.IsNullOrEmpty(sale.CustomerPhone))
        {
            sb.Append($"Phone: {sale.CustomerPhone}\n");
        }
        sb.Append("--------------------------------\n");
        
        // Items
        sb.Append("Item                Qty    Price\n");
        sb.Append("--------------------------------\n");
        foreach (var item in sale.Items)
        {
            var itemName = item.ProductName.Length > 18 ? item.ProductName.Substring(0, 18) : item.ProductName;
            sb.Append($"{itemName,-18} {item.Quantity,3} {item.UnitPrice,8:F2}\n");
            if (item.DiscountAmount > 0)
            {
                sb.Append($"  Discount: -{item.DiscountAmount:F2}\n");
            }
        }
        sb.Append("--------------------------------\n");
        
        // Totals
        sb.Append($"Subtotal:                    {sale.SubTotal,8:F2}\n");
        if (sale.DiscountAmount > 0)
        {
            sb.Append($"Discount:                   -{sale.DiscountAmount,7:F2}\n");
        }
        if (sale.TaxAmount > 0)
        {
            sb.Append($"Tax (GST):                    {sale.TaxAmount,8:F2}\n");
        }
        sb.Append("\x1D\x21\x11"); // Double size
        sb.Append($"TOTAL:                       {sale.TotalAmount,8:F2}\n");
        sb.Append("\x1D\x21\x00"); // Normal size
        
        // Payment info
        sb.Append("--------------------------------\n");
        sb.Append($"Payment: {sale.PaymentMethod}\n");
        if (sale.CashAmount > 0)
        {
            sb.Append($"Cash: {sale.CashAmount:F2}\n");
            var changeAmount = sale.CashAmount - sale.TotalAmount;
            if (changeAmount > 0)
            {
                sb.Append($"Change: {changeAmount:F2}\n");
            }
        }
        
        // Footer
        sb.Append("--------------------------------\n");
        sb.Append("\x1B\x61\x01"); // Center align
        sb.Append("Thank you for shopping!\n");
        sb.Append("Visit us again!\n");
        sb.Append("\n\n\n"); // Feed paper
        
        return sb.ToString();
    }

    public async Task<bool> IsPrinterConnectedAsync(CancellationToken cancellationToken = default)
    {
        return await Task.FromResult(_serialPort?.IsOpen == true);
    }

    public async Task DisconnectAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_serialPort?.IsOpen == true)
            {
                _serialPort.Close();
                _logger.LogInformation("Receipt printer disconnected");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disconnecting receipt printer");
        }
        await Task.CompletedTask;
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

