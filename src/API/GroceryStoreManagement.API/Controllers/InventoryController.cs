using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Queries.Inventory;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/inventory")]
[Authorize(Roles = "Admin,Staff,SuperAdmin")]
public class InventoryController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<InventoryController> _logger;

    public InventoryController(IMediator mediator, ILogger<InventoryController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of products with stock information and batches
    /// </summary>
    [HttpGet("products")]
    public async Task<ActionResult> GetProducts(
        [FromQuery] string? search = null,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] bool? lowStock = null,
        [FromQuery] bool? expirySoon = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetInventoryProductsQuery
        {
            Search = search,
            CategoryId = categoryId,
            LowStock = lowStock,
            ExpirySoon = expirySoon,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get product with inventory batches
    /// </summary>
    [HttpGet("product/{id}")]
    public async Task<ActionResult> GetProduct(Guid id)
    {
        var query = new Application.Queries.Products.GetProductByIdQuery { Id = id };
        var product = await _mediator.Send(query);

        if (product == null)
            return NotFound();

        return Ok(product);
    }

    /// <summary>
    /// Manual stock adjustment
    /// </summary>
    [HttpPost("adjustment")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult> StockAdjustment([FromBody] Application.Commands.Inventory.AdjustInventoryCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Get products with low stock
    /// </summary>
    [HttpGet("low-stock")]
    public async Task<ActionResult<List<LowStockProductDto>>> GetLowStock([FromQuery] int? threshold = null)
    {
        var query = new GetLowStockQuery { Threshold = threshold };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get batches expiring soon
    /// </summary>
    [HttpGet("expiry-soon")]
    public async Task<ActionResult<List<ExpirySoonBatchDto>>> GetExpirySoon([FromQuery] int daysThreshold = 7)
    {
        var query = new GetExpirySoonQuery { DaysThreshold = daysThreshold };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get stock valuation (FIFO/LIFO)
    /// </summary>
    [HttpGet("valuation")]
    public async Task<ActionResult<Application.DTOs.InventoryValuationDto>> GetValuation(
        [FromQuery] string method = "FIFO",
        [FromQuery] Guid? productId = null)
    {
        var query = new Application.Queries.Inventory.GetInventoryValuationQuery
        {
            Method = method,
            ProductId = productId
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
