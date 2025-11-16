using Microsoft.AspNetCore.SignalR;

namespace GroceryStoreManagement.API.Hubs;

/// <summary>
/// SignalR hub for import job progress notifications
/// </summary>
public class ImportProgressHub : Hub
{
    public async Task JoinJobGroup(string jobId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Job_{jobId}");
    }

    public async Task LeaveJobGroup(string jobId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Job_{jobId}");
    }
}

