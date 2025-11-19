using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Queries.StoreSettings;
using GroceryStoreManagement.Application.Commands.StoreSettings;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class StoreSettingsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<StoreSettingsController> _logger;

    public StoreSettingsController(IMediator mediator, ILogger<StoreSettingsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    [AllowAnonymous] // Allow anonymous for public store info
    public async Task<ActionResult<Application.DTOs.StoreSettingsDto>> GetStoreSettings()
    {
        var query = new GetStoreSettingsQuery();
        var settings = await _mediator.Send(query);
        
        if (settings == null)
            return NotFound();

        return Ok(settings);
    }

    [HttpPut]
    public async Task<ActionResult<Application.DTOs.StoreSettingsDto>> UpdateStoreSettings([FromBody] UpdateStoreSettingsCommand command)
    {
        var settings = await _mediator.Send(command);
        return Ok(settings);
    }
}

