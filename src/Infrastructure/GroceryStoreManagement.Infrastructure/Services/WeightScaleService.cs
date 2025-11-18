using GroceryStoreManagement.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.IO.Ports;

namespace GroceryStoreManagement.Infrastructure.Services;

public class WeightScaleService : IWeightScaleService, IDisposable
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<WeightScaleService> _logger;
    private SerialPort? _serialPort;
    private bool _disposed = false;

    public WeightScaleService(IConfiguration configuration, ILogger<WeightScaleService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> ConnectAsync(string? port = null, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_serialPort?.IsOpen == true)
            {
                return true;
            }

            port ??= _configuration["WeightScale:Port"] ?? "COM1";
            var baudRate = int.Parse(_configuration["WeightScale:BaudRate"] ?? "9600");

            _serialPort = new SerialPort(port, baudRate, Parity.None, 8, StopBits.One)
            {
                ReadTimeout = 1000,
                WriteTimeout = 1000
            };

            _serialPort.Open();
            _logger.LogInformation("Weight scale connected on port {Port}", port);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to weight scale on port {Port}", port);
            return false;
        }
    }

    public async Task<decimal> ReadWeightAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_serialPort?.IsOpen != true)
            {
                var connected = await ConnectAsync(cancellationToken: cancellationToken);
                if (!connected)
                {
                    throw new InvalidOperationException("Weight scale is not connected.");
                }
            }

            // Clear buffer
            _serialPort!.DiscardInBuffer();

            // Send read command (common ESC/POS or Mettler Toledo command)
            // This is a generic implementation - actual command depends on scale model
            _serialPort.Write("\x1B\x50"); // ESC P command (example)

            await Task.Delay(100, cancellationToken); // Wait for response

            // Read response
            var response = _serialPort.ReadExisting();
            
            // Parse weight from response (format depends on scale model)
            // Example: "ST,GS,+0001.23kg" or "0.123 kg"
            if (decimal.TryParse(response.Trim().Split(' ')[0], out var weight))
            {
                return weight;
            }

            throw new InvalidOperationException($"Unable to parse weight from response: {response}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to read weight from scale");
            throw;
        }
    }

    public async Task<bool> TareAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_serialPort?.IsOpen != true)
            {
                var connected = await ConnectAsync(cancellationToken: cancellationToken);
                if (!connected)
                {
                    return false;
                }
            }

            // Send tare command (common ESC/POS command)
            _serialPort!.Write("\x1B\x54"); // ESC T command (example)

            await Task.Delay(200, cancellationToken); // Wait for tare to complete

            _logger.LogInformation("Weight scale tared");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to tare weight scale");
            return false;
        }
    }

    public async Task<bool> IsConnectedAsync(CancellationToken cancellationToken = default)
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
                _logger.LogInformation("Weight scale disconnected");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disconnecting weight scale");
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

