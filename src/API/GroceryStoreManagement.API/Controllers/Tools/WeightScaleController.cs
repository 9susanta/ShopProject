using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Interfaces;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/weight-scale")]
[Authorize(Roles = "Admin,Staff,SuperAdmin")]
public class WeightScaleController : ControllerBase
{
    private readonly IWeightScaleService _weightScaleService;
    private readonly ILogger<WeightScaleController> _logger;

    public WeightScaleController(
        IWeightScaleService weightScaleService,
        ILogger<WeightScaleController> logger)
    {
        _weightScaleService = weightScaleService;
        _logger = logger;
    }

    /// <summary>
    /// Read current weight from scale
    /// </summary>
    [HttpGet("read")]
    public async Task<ActionResult<object>> ReadWeight(CancellationToken cancellationToken)
    {
        try
        {
            var weight = await _weightScaleService.ReadWeightAsync(cancellationToken);
            return Ok(new { weight, unit = "kg", timestamp = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading weight");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Tare the scale (zero it)
    /// </summary>
    [HttpPost("tare")]
    public async Task<ActionResult<object>> Tare(CancellationToken cancellationToken)
    {
        try
        {
            var success = await _weightScaleService.TareAsync(cancellationToken);
            if (success)
            {
                return Ok(new { success = true, message = "Scale tared successfully" });
            }
            return BadRequest(new { error = "Failed to tare scale" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error taring scale");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get connection status
    /// </summary>
    [HttpGet("status")]
    public async Task<ActionResult<object>> GetStatus(CancellationToken cancellationToken)
    {
        try
        {
            var isConnected = await _weightScaleService.IsConnectedAsync(cancellationToken);
            return Ok(new { isConnected, timestamp = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting scale status");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Connect to weight scale
    /// </summary>
    [HttpPost("connect")]
    public async Task<ActionResult<object>> Connect([FromQuery] string? port, CancellationToken cancellationToken)
    {
        try
        {
            var success = await _weightScaleService.ConnectAsync(port, cancellationToken);
            if (success)
            {
                return Ok(new { success = true, message = "Connected to weight scale" });
            }
            return BadRequest(new { error = "Failed to connect to weight scale" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error connecting to scale");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Disconnect from weight scale
    /// </summary>
    [HttpPost("disconnect")]
    public async Task<ActionResult<object>> Disconnect(CancellationToken cancellationToken)
    {
        try
        {
            await _weightScaleService.DisconnectAsync(cancellationToken);
            return Ok(new { success = true, message = "Disconnected from weight scale" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disconnecting from scale");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

