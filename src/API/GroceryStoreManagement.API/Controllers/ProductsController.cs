using MediatR;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.Products;
using GroceryStoreManagement.Application.Queries.Products;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IMediator mediator, ILogger<ProductsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<Application.DTOs.ProductDto>> CreateProduct([FromBody] CreateProductCommand command)
    {
        var product = await _mediator.Send(command);
        return Ok(product);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Application.DTOs.ProductDto>> GetProduct(Guid id)
    {
        var query = new GetProductByIdQuery { Id = id };
        var product = await _mediator.Send(query);
        
        if (product == null)
            return NotFound();

        return Ok(product);
    }

    [HttpGet("category/{categoryId}")]
    public async Task<ActionResult<List<Application.DTOs.ProductDto>>> GetProductsByCategory(Guid categoryId, [FromQuery] bool includeInactive = false)
    {
        var query = new GetProductsByCategoryQuery 
        { 
            CategoryId = categoryId,
            IncludeInactive = includeInactive
        };
        var products = await _mediator.Send(query);
        return Ok(products);
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<Application.DTOs.ProductDto>>> SearchProducts(
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? barcode = null,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] int maxResults = 50)
    {
        var query = new SearchProductsQuery
        {
            SearchTerm = searchTerm,
            Barcode = barcode,
            CategoryId = categoryId,
            MaxResults = maxResults
        };
        var products = await _mediator.Send(query);
        return Ok(products);
    }
}
