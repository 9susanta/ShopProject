using MediatR;
using Microsoft.AspNetCore.Mvc;
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

    [HttpGet("phone/{phone}")]
    public async Task<ActionResult<Application.DTOs.CustomerDto>> GetCustomerByPhone(string phone)
    {
        var query = new GetCustomerByPhoneQuery { Phone = phone };
        var customer = await _mediator.Send(query);
        
        if (customer == null)
            return NotFound();

        return Ok(customer);
    }
}

