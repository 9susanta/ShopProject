using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.Sync;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/sync")]
[Authorize(Roles = "Admin,Staff,SuperAdmin")]
public class SyncController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<SyncController> _logger;

    public SyncController(IMediator mediator, ILogger<SyncController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Sync offline sales to server
    /// </summary>
    [HttpPost("offline-sales")]
    public async Task<ActionResult<SyncOfflineSalesResponse>> SyncOfflineSales([FromBody] SyncOfflineSalesCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Get sync status
    /// </summary>
    [HttpGet("status")]
    public ActionResult<object> GetSyncStatus()
    {
        return Ok(new { isOnline = true, timestamp = DateTime.UtcNow });
    }
}



