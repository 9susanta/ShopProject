using MediatR;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Queries.Units;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UnitsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<UnitsController> _logger;

    public UnitsController(IMediator mediator, ILogger<UnitsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<Application.DTOs.UnitDto>>> GetUnits([FromQuery] bool? isActive = true)
    {
        var query = new GetUnitsQuery { IsActive = isActive };
        var units = await _mediator.Send(query);
        return Ok(units);
    }
}

