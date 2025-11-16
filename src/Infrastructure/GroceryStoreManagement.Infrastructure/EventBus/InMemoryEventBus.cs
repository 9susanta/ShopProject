using GroceryStoreManagement.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.EventBus;

public class InMemoryEventBus : IEventBus
{
    private readonly Dictionary<Type, List<Func<object, CancellationToken, Task>>> _handlers = new();
    private readonly ILogger<InMemoryEventBus> _logger;

    public InMemoryEventBus(ILogger<InMemoryEventBus> logger)
    {
        _logger = logger;
    }

    public Task PublishAsync<T>(T eventData, CancellationToken cancellationToken = default) where T : class
    {
        _logger.LogInformation("Publishing event: {EventType}", typeof(T).Name);

        if (_handlers.TryGetValue(typeof(T), out var handlers))
        {
            foreach (var handler in handlers)
            {
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await handler(eventData, cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error handling event: {EventType}", typeof(T).Name);
                    }
                }, cancellationToken);
            }
        }

        return Task.CompletedTask;
    }

    public Task SubscribeAsync<T>(Func<T, CancellationToken, Task> handler, CancellationToken cancellationToken = default) where T : class
    {
        _logger.LogInformation("Subscribing to event: {EventType}", typeof(T).Name);

        if (!_handlers.ContainsKey(typeof(T)))
        {
            _handlers[typeof(T)] = new List<Func<object, CancellationToken, Task>>();
        }

        _handlers[typeof(T)].Add((data, ct) => handler((T)data, ct));

        return Task.CompletedTask;
    }
}

