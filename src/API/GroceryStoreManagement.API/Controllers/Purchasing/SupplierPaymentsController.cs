using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.Suppliers;
using GroceryStoreManagement.Application.Queries.Suppliers;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/suppliers")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class SupplierPaymentsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<SupplierPaymentsController> _logger;

    public SupplierPaymentsController(IMediator mediator, ILogger<SupplierPaymentsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Record a payment to a supplier
    /// </summary>
    [HttpPost("{supplierId}/payments")]
    public async Task<ActionResult<Application.DTOs.SupplierPaymentDto>> CreatePayment(
        Guid supplierId,
        [FromBody] CreateSupplierPaymentCommand command)
    {
        command.SupplierId = supplierId;
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Get outstanding payments for all suppliers or a specific supplier
    /// </summary>
    [HttpGet("outstanding")]
    public async Task<ActionResult<List<Application.DTOs.OutstandingPaymentDto>>> GetOutstandingPayments(
        [FromQuery] Guid? supplierId)
    {
        var query = new GetOutstandingPaymentsQuery { SupplierId = supplierId };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get payment history for a supplier
    /// </summary>
    [HttpGet("{supplierId}/payments")]
    public async Task<ActionResult<List<Application.DTOs.SupplierPaymentDto>>> GetSupplierPayments(
        Guid supplierId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var query = new GetSupplierPaymentsQuery
        {
            SupplierId = supplierId,
            StartDate = startDate,
            EndDate = endDate
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}

