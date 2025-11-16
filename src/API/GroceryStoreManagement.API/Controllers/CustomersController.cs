using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.Customers;
using GroceryStoreManagement.Application.Queries.Customers;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<CustomersController> _logger;

    public CustomersController(IMediator mediator, ILogger<CustomersController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Application.DTOs.CustomerListResponseDto>> GetCustomers(
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetCustomersQuery
        {
            Search = search,
            IsActive = isActive,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Application.DTOs.CustomerDto>> GetCustomer(Guid id)
    {
        var query = new GetCustomerByIdQuery { Id = id };
        var customer = await _mediator.Send(query);
        
        if (customer == null)
            return NotFound();

        return Ok(customer);
    }

    [HttpGet("by-phone/{phone}")]
    [AllowAnonymous] // For POS phone-based lookup
    public async Task<ActionResult<Application.DTOs.CustomerDto>> GetCustomerByPhone(string phone)
    {
        var query = new GetCustomerByPhoneQuery { Phone = phone };
        var customer = await _mediator.Send(query);
        
        if (customer == null)
            return NotFound();

        return Ok(customer);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Application.DTOs.CustomerDto>> CreateCustomer([FromBody] CreateCustomerCommand command)
    {
        var customer = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Application.DTOs.CustomerDto>> UpdateCustomer(Guid id, [FromBody] UpdateCustomerCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");

        var customer = await _mediator.Send(command);
        return Ok(customer);
    }
}
