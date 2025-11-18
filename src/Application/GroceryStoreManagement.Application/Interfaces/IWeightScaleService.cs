namespace GroceryStoreManagement.Application.Interfaces;

public interface IWeightScaleService
{
    Task<decimal> ReadWeightAsync(CancellationToken cancellationToken = default);
    Task<bool> TareAsync(CancellationToken cancellationToken = default);
    Task<bool> IsConnectedAsync(CancellationToken cancellationToken = default);
    Task<bool> ConnectAsync(string? port = null, CancellationToken cancellationToken = default);
    Task DisconnectAsync(CancellationToken cancellationToken = default);
}

