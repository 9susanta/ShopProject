using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.API.Hubs;
using GroceryStoreManagement.Infrastructure.Services;
using Microsoft.AspNetCore.SignalR;

namespace GroceryStoreManagement.API.DI;

public static class NotificationServiceRegistration
{
    public static IServiceCollection AddNotificationService(this IServiceCollection services)
    {
        // Register NotificationService with IHubContext<InventoryHub>
        services.AddScoped<INotificationService>(sp =>
        {
            var hubContext = sp.GetRequiredService<IHubContext<InventoryHub>>();
            var smsService = sp.GetRequiredService<ISmsService>();
            var logger = sp.GetRequiredService<ILogger<NotificationService<InventoryHub>>>();
            return new NotificationService<InventoryHub>(hubContext, smsService, logger);
        });

        return services;
    }
}

