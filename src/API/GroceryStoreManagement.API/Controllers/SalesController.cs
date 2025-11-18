using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.Sales;
using GroceryStoreManagement.Application.Queries.Sales;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SalesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<SalesController> _logger;

    public SalesController(IMediator mediator, ILogger<SalesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff,SuperAdmin")]
    public async Task<ActionResult<Application.DTOs.SaleListResponseDto>> GetSales(
        [FromQuery] string? search = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetSalesQuery
        {
            Search = search,
            CustomerId = customerId,
            Status = status,
            FromDate = fromDate,
            ToDate = toDate,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get sale by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Staff,SuperAdmin")]
    public async Task<ActionResult<Application.DTOs.SaleDto>> GetSale(Guid id)
    {
        var query = new GetSaleByIdQuery { Id = id };
        var sale = await _mediator.Send(query);
        
        if (sale == null)
            return NotFound();

        return Ok(sale);
    }

    [HttpPost]
    public async Task<ActionResult<Application.DTOs.SaleDto>> CreateSale([FromBody] CreateSaleCommand command)
    {
        var sale = await _mediator.Send(command);
        return Ok(sale);
    }
}

