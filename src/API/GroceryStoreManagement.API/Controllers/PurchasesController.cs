using MediatR;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.Purchases;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PurchasesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<PurchasesController> _logger;

    public PurchasesController(IMediator mediator, ILogger<PurchasesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<Application.DTOs.PurchaseOrderDto>> CreatePurchaseOrder([FromBody] CreatePurchaseOrderCommand command)
    {
        var purchaseOrder = await _mediator.Send(command);
        return Ok(purchaseOrder);
    }

    [HttpPost("{id}/receive")]
    public async Task<ActionResult<Application.DTOs.PurchaseOrderDto>> ReceivePurchaseOrder(Guid id, [FromBody] ReceivePurchaseOrderCommand? command = null)
    {
        command ??= new ReceivePurchaseOrderCommand { PurchaseOrderId = id };
        command.PurchaseOrderId = id;
        
        var purchaseOrder = await _mediator.Send(command);
        return Ok(purchaseOrder);
    }
}

