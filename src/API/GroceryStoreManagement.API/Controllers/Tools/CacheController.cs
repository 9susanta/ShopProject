using GroceryStoreManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CacheController : ControllerBase
{
    private readonly ICacheService _cacheService;
    private readonly ILogger<CacheController> _logger;

    public CacheController(ICacheService cacheService, ILogger<CacheController> logger)
    {
        _cacheService = cacheService;
        _logger = logger;
    }

    /// <summary>
    /// Clear all cache entries matching a pattern
    /// </summary>
    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCache([FromQuery] string? pattern = null)
    {
        if (string.IsNullOrWhiteSpace(pattern))
        {
            pattern = ".*"; // Clear all
        }

        await _cacheService.RemoveByPatternAsync(pattern);
        _logger.LogInformation("Cache cleared for pattern: {Pattern}", pattern);

        return Ok(new { message = $"Cache cleared for pattern: {pattern}" });
    }

    /// <summary>
    /// Clear cache for a specific key
    /// </summary>
    [HttpDelete("{key}")]
    public async Task<IActionResult> ClearCacheKey(string key)
    {
        await _cacheService.RemoveAsync(key);
        _logger.LogInformation("Cache cleared for key: {Key}", key);

        return Ok(new { message = $"Cache cleared for key: {key}" });
    }
}

