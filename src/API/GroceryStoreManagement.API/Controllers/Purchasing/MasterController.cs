using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Queries.Suppliers;
using GroceryStoreManagement.Application.Commands.Suppliers;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/master")]
[Authorize] // Require authentication for all master data endpoints
public class MasterController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<MasterController> _logger;

    public MasterController(IMediator mediator, ILogger<MasterController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of suppliers
    /// </summary>
    [HttpGet("suppliers")]
    public async Task<ActionResult<Application.DTOs.SupplierListResponseDto>> GetSuppliers(
        [FromQuery] bool? isActive = null,
        [FromQuery] string? search = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 100)
    {
        var query = new GetSuppliersQuery
        {
            IsActive = isActive,
            Search = search,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get supplier by ID
    /// </summary>
    [HttpGet("suppliers/{id}")]
    public async Task<ActionResult<Application.DTOs.SupplierDto>> GetSupplier(Guid id)
    {
        var query = new GetSuppliersQuery { PageSize = 1 };
        var result = await _mediator.Send(query);
        var supplier = result.Items.FirstOrDefault(s => s.Id == id);
        
        if (supplier == null)
            return NotFound();

        return Ok(supplier);
    }

    /// <summary>
    /// Create a new supplier
    /// </summary>
    [HttpPost("suppliers")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<Application.DTOs.SupplierDto>> CreateSupplier([FromBody] CreateSupplierCommand command)
    {
        var supplier = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplier);
    }

    /// <summary>
    /// Update an existing supplier
    /// </summary>
    [HttpPut("suppliers/{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<Application.DTOs.SupplierDto>> UpdateSupplier(Guid id, [FromBody] UpdateSupplierCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");

        var supplier = await _mediator.Send(command);
        return Ok(supplier);
    }
}

