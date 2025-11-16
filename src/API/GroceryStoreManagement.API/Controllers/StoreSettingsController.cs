using MediatR;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Queries.StoreSettings;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
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
    public async Task<ActionResult<Application.DTOs.StoreSettingsDto>> GetStoreSettings()
    {
        var query = new GetStoreSettingsQuery();
        var settings = await _mediator.Send(query);
        
        if (settings == null)
            return NotFound();

        return Ok(settings);
    }
}

