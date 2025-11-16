using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.Purchases;
using GroceryStoreManagement.Application.Queries.Purchases;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/purchasing")]
[Authorize(Roles = "Admin,Staff")]
public class PurchasingController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<PurchasingController> _logger;

    public PurchasingController(IMediator mediator, ILogger<PurchasingController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Create a new purchase order
    /// </summary>
    [HttpPost("purchase-orders")]
    public async Task<ActionResult<Application.DTOs.PurchaseOrderDto>> CreatePurchaseOrder([FromBody] CreatePurchaseOrderCommand command)
    {
        var purchaseOrder = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetPurchaseOrder), new { id = purchaseOrder.Id }, purchaseOrder);
    }

    /// <summary>
    /// Update an existing purchase order
    /// </summary>
    [HttpPut("purchase-orders/{id}")]
    public async Task<ActionResult<Application.DTOs.PurchaseOrderDto>> UpdatePurchaseOrder(Guid id, [FromBody] UpdatePurchaseOrderCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");

        var purchaseOrder = await _mediator.Send(command);
        return Ok(purchaseOrder);
    }

    /// <summary>
    /// Get paginated list of purchase orders with filters
    /// </summary>
    [HttpGet("purchase-orders")]
    public async Task<ActionResult<PurchaseOrderListResponseDto>> GetPurchaseOrders(
        [FromQuery] Guid? supplierId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? status = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetPurchaseOrdersQuery
        {
            SupplierId = supplierId,
            StartDate = startDate,
            EndDate = endDate,
            Status = status,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get purchase order by ID
    /// </summary>
    [HttpGet("purchase-orders/{id}")]
    public async Task<ActionResult<Application.DTOs.PurchaseOrderDto>> GetPurchaseOrder(Guid id)
    {
        var query = new GetPurchaseOrderByIdQuery { Id = id };
        var purchaseOrder = await _mediator.Send(query);

        if (purchaseOrder == null)
            return NotFound();

        return Ok(purchaseOrder);
    }

    /// <summary>
    /// Approve a pending purchase order
    /// </summary>
    [HttpPost("purchase-orders/{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Application.DTOs.PurchaseOrderDto>> ApprovePurchaseOrder(Guid id)
    {
        var command = new ApprovePurchaseOrderCommand { Id = id };
        var purchaseOrder = await _mediator.Send(command);
        return Ok(purchaseOrder);
    }

    /// <summary>
    /// Cancel a purchase order
    /// </summary>
    [HttpPost("purchase-orders/{id}/cancel")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Application.DTOs.PurchaseOrderDto>> CancelPurchaseOrder(Guid id, [FromBody] CancelPurchaseOrderCommand? command = null)
    {
        var cancelCommand = command ?? new CancelPurchaseOrderCommand { Id = id };
        if (cancelCommand.Id != id)
            cancelCommand.Id = id;

        var purchaseOrder = await _mediator.Send(cancelCommand);
        return Ok(purchaseOrder);
    }
}

