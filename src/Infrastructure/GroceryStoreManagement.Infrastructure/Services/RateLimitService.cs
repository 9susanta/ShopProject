using System.Collections.Concurrent;
using GroceryStoreManagement.Application.Interfaces;

namespace GroceryStoreManagement.Infrastructure.Services;

/// <summary>
/// In-memory rate limiting service using sliding window algorithm
/// </summary>
public class RateLimitService : IRateLimitService, IDisposable
{
    private readonly ConcurrentDictionary<string, RateLimitWindow> _windows = new();
    private readonly Timer _cleanupTimer;
    private bool _disposed = false;

    public RateLimitService()
    {
        // Cleanup expired windows every 5 minutes
        _cleanupTimer = new Timer(CleanupExpiredWindows, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(5));
    }

    public bool IsAllowed(string key, int maxRequests, TimeSpan window)
    {
        var windowKey = $"{key}:{window.TotalSeconds}";
        var windowEntry = _windows.GetOrAdd(windowKey, _ => new RateLimitWindow(window));

        lock (windowEntry)
        {
            var now = DateTime.UtcNow;
            windowEntry.RemoveExpiredRequests(now);

            if (windowEntry.Requests.Count >= maxRequests)
            {
                return false;
            }

            windowEntry.Requests.Add(now);
            return true;
        }
    }

    public RateLimitInfo GetRateLimitInfo(string key, int maxRequests, TimeSpan window)
    {
        var windowKey = $"{key}:{window.TotalSeconds}";
        if (!_windows.TryGetValue(windowKey, out var windowEntry))
        {
            return new RateLimitInfo
            {
                Remaining = maxRequests,
                ResetAt = DateTime.UtcNow.Add(window)
            };
        }

        lock (windowEntry)
        {
            var now = DateTime.UtcNow;
            windowEntry.RemoveExpiredRequests(now);

            var remaining = Math.Max(0, maxRequests - windowEntry.Requests.Count);
            var resetAt = windowEntry.Requests.Any()
                ? windowEntry.Requests.Min().Add(window)
                : now.Add(window);

            return new RateLimitInfo
            {
                Remaining = remaining,
                ResetAt = resetAt
            };
        }
    }

    public void Reset(string key, TimeSpan window)
    {
        var windowKey = $"{key}:{window.TotalSeconds}";
        _windows.TryRemove(windowKey, out _);
    }

    private void CleanupExpiredWindows(object? state)
    {
        var now = DateTime.UtcNow;
        var keysToRemove = new List<string>();

        foreach (var kvp in _windows)
        {
            lock (kvp.Value)
            {
                kvp.Value.RemoveExpiredRequests(now);
                if (!kvp.Value.Requests.Any() && now > kvp.Value.LastAccess.AddMinutes(10))
                {
                    keysToRemove.Add(kvp.Key);
                }
            }
        }

        foreach (var key in keysToRemove)
        {
            _windows.TryRemove(key, out _);
        }
    }

    private class RateLimitWindow
    {
        public List<DateTime> Requests { get; } = new();
        public TimeSpan Window { get; }
        public DateTime LastAccess { get; set; } = DateTime.UtcNow;

        public RateLimitWindow(TimeSpan window)
        {
            Window = window;
        }

        public void RemoveExpiredRequests(DateTime now)
        {
            var cutoff = now.Subtract(Window);
            Requests.RemoveAll(r => r < cutoff);
            LastAccess = now;
        }
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            _cleanupTimer?.Dispose();
            _windows.Clear();
            _disposed = true;
        }
    }
}

