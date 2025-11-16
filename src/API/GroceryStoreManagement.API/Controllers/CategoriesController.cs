using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.Categories;
using GroceryStoreManagement.Application.Queries.Categories;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(IMediator mediator, ILogger<CategoriesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<Application.DTOs.CategoryDto>>> GetCategories([FromQuery] bool? isActive = null)
    {
        var query = new GetCategoriesQuery { IsActive = isActive };
        var categories = await _mediator.Send(query);
        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Application.DTOs.CategoryDto>> GetCategory(Guid id)
    {
        var query = new GetCategoryByIdQuery { Id = id };
        var category = await _mediator.Send(query);
        
        if (category == null)
            return NotFound();

        return Ok(category);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Application.DTOs.CategoryDto>> CreateCategory([FromBody] CreateCategoryCommand command)
    {
        var category = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Application.DTOs.CategoryDto>> UpdateCategory(Guid id, [FromBody] UpdateCategoryCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");

        var category = await _mediator.Send(command);
        return Ok(category);
    }
}

