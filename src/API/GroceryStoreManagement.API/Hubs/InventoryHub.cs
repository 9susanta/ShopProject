using Microsoft.AspNetCore.SignalR;

namespace GroceryStoreManagement.API.Hubs;

/// <summary>
/// SignalR Hub for real-time inventory notifications
/// </summary>
public class InventoryHub : Hub
{
    public async Task JoinInventoryGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "inventory-updates");
    }

    public async Task LeaveInventoryGroup()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "inventory-updates");
    }
}

