using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.Sales;
using GroceryStoreManagement.Application.Queries.Sales;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/sales")]
[Authorize(Roles = "Admin,Staff,SuperAdmin")]
public class SaleReturnsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<SaleReturnsController> _logger;

    public SaleReturnsController(IMediator mediator, ILogger<SaleReturnsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Create a sale return
    /// </summary>
    [HttpPost("{saleId}/returns")]
    public async Task<ActionResult<Application.DTOs.SaleReturnDto>> CreateSaleReturn(
        Guid saleId,
        [FromBody] CreateSaleReturnCommand command)
    {
        if (saleId != command.SaleId)
            return BadRequest("Sale ID mismatch");

        var saleReturn = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetSaleReturn), new { id = saleReturn.Id }, saleReturn);
    }

    /// <summary>
    /// Process refund for a sale return
    /// </summary>
    [HttpPost("returns/{returnId}/refund")]
    public async Task<ActionResult<Application.DTOs.RefundDto>> ProcessRefund(
        Guid returnId,
        [FromBody] ProcessRefundCommand command)
    {
        if (returnId != command.SaleReturnId)
            return BadRequest("Return ID mismatch");

        var refund = await _mediator.Send(command);
        return Ok(refund);
    }

    /// <summary>
    /// Get list of sale returns
    /// </summary>
    [HttpGet("returns")]
    public async Task<ActionResult<List<Application.DTOs.SaleReturnDto>>> GetSaleReturns(
        [FromQuery] Guid? saleId = null,
        [FromQuery] ReturnStatus? status = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var query = new GetSaleReturnsQuery
        {
            SaleId = saleId,
            Status = status,
            StartDate = startDate,
            EndDate = endDate
        };

        var returns = await _mediator.Send(query);
        return Ok(returns);
    }

    /// <summary>
    /// Get sale return by ID
    /// </summary>
    [HttpGet("returns/{id}")]
    public async Task<ActionResult<Application.DTOs.SaleReturnDto>> GetSaleReturn(Guid id)
    {
        var query = new GetSaleReturnByIdQuery { Id = id };
        var saleReturn = await _mediator.Send(query);

        if (saleReturn == null)
            return NotFound();

        return Ok(saleReturn);
    }
}


