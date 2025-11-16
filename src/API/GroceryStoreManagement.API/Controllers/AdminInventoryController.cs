using GroceryStoreManagement.Application.Commands.Inventory;
using GroceryStoreManagement.Application.Queries.Inventory;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GroceryStoreManagement.API.Controllers;

/// <summary>
/// Admin controller for inventory management
/// </summary>
[ApiController]
[Route("api/admin/inventory")]
[Authorize(Roles = "Admin")]
public class AdminInventoryController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AdminInventoryController> _logger;

    public AdminInventoryController(IMediator mediator, ILogger<AdminInventoryController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Adjust inventory manually (increase or decrease stock)
    /// </summary>
    [HttpPost("adjust")]
    public async Task<ActionResult<Application.DTOs.InventoryAdjustmentDto>> AdjustInventory(
        [FromBody] AdjustInventoryCommand command,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get low stock products
    /// </summary>
    [HttpGet("low-stock")]
    public async Task<ActionResult<List<Application.DTOs.InventoryDto>>> GetLowStock(
        [FromQuery] int? threshold = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetLowStockQuery { Threshold = threshold };
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get products expiring soon
    /// </summary>
    [HttpGet("expiry-soon")]
    public async Task<ActionResult<List<Application.DTOs.InventoryDto>>> GetExpirySoon(
        [FromQuery] int daysThreshold = 7,
        CancellationToken cancellationToken = default)
    {
        var query = new GetExpirySoonQuery { DaysThreshold = daysThreshold };
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }
}

