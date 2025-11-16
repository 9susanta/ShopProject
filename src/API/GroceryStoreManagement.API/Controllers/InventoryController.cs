using MediatR;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Queries.Inventory;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<InventoryController> _logger;

    public InventoryController(IMediator mediator, ILogger<InventoryController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<Application.DTOs.InventoryDto>> GetInventoryByProductId(Guid productId)
    {
        var query = new GetInventoryByProductIdQuery { ProductId = productId };
        var inventory = await _mediator.Send(query);
        
        if (inventory == null)
            return NotFound();

        return Ok(inventory);
    }
}

