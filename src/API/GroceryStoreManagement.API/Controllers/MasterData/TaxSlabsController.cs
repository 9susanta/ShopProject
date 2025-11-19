using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.TaxSlabs;
using GroceryStoreManagement.Application.Queries.TaxSlabs;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaxSlabsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<TaxSlabsController> _logger;

    public TaxSlabsController(IMediator mediator, ILogger<TaxSlabsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<Application.DTOs.TaxSlabDto>>> GetTaxSlabs([FromQuery] bool? isActive = true)
    {
        var query = new GetTaxSlabsQuery { IsActive = isActive };
        var taxSlabs = await _mediator.Send(query);
        return Ok(taxSlabs);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Application.DTOs.TaxSlabDto>> CreateTaxSlab([FromBody] CreateTaxSlabCommand command)
    {
        var taxSlab = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetTaxSlabs), new { id = taxSlab.Id }, taxSlab);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Application.DTOs.TaxSlabDto>> UpdateTaxSlab(Guid id, [FromBody] UpdateTaxSlabCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");

        var taxSlab = await _mediator.Send(command);
        return Ok(taxSlab);
    }
}

