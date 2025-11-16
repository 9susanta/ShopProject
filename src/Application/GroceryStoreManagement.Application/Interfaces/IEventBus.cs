namespace GroceryStoreManagement.Application.Interfaces;

public interface IEventBus
{
    Task PublishAsync<T>(T eventData, CancellationToken cancellationToken = default) where T : class;
    Task SubscribeAsync<T>(Func<T, CancellationToken, Task> handler, CancellationToken cancellationToken = default) where T : class;
}

