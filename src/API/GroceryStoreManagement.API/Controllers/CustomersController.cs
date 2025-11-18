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

    [HttpGet("{id}/purchase-history")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<Application.DTOs.SaleListResponseDto>> GetPurchaseHistory(
        Guid id,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var query = new GetCustomerPurchaseHistoryQuery
        {
            CustomerId = id,
            PageNumber = pageNumber,
            PageSize = pageSize,
            StartDate = startDate,
            EndDate = endDate
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}/pay-later-ledger")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<Application.DTOs.PayLaterLedgerListResponseDto>> GetPayLaterLedger(
        Guid id,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var query = new GetCustomerPayLaterLedgerQuery
        {
            CustomerId = id,
            PageNumber = pageNumber,
            PageSize = pageSize,
            StartDate = startDate,
            EndDate = endDate
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}/saved-items")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<Application.DTOs.CustomerSavedItemListResponseDto>> GetSavedItems(
        Guid id,
        [FromQuery] bool? isFavorite = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50)
    {
        var query = new GetCustomerSavedItemsQuery
        {
            CustomerId = id,
            IsFavorite = isFavorite,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("{id}/saved-items")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<Application.DTOs.CustomerSavedItemDto>> AddSavedItem(
        Guid id,
        [FromBody] AddCustomerSavedItemCommand command)
    {
        if (id != command.CustomerId)
            return BadRequest("ID mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPut("{id}/pay-later-settings")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Application.DTOs.CustomerDto>> UpdatePayLaterSettings(
        Guid id,
        [FromBody] UpdateCustomerPayLaterSettingsCommand command)
    {
        if (id != command.CustomerId)
            return BadRequest("ID mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("{id}/pay-later-payment")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<Application.DTOs.PayLaterLedgerEntryDto>> RecordPayLaterPayment(
        Guid id,
        [FromBody] RecordPayLaterPaymentCommand command)
    {
        if (id != command.CustomerId)
            return BadRequest("ID mismatch");

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("{id}/pay-later-balance")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<Application.DTOs.PayLaterBalanceDto>> GetPayLaterBalance(Guid id)
    {
        var query = new GetCustomerByIdQuery { Id = id };
        var customer = await _mediator.Send(query);
        
        if (customer == null)
            return NotFound();

        return Ok(new Application.DTOs.PayLaterBalanceDto
        {
            CustomerId = customer.Id,
            Balance = customer.PayLaterBalance,
            Limit = customer.PayLaterLimit,
            IsEnabled = customer.IsPayLaterEnabled,
            AvailableCredit = Math.Max(0, customer.PayLaterLimit - customer.PayLaterBalance)
        });
    }
}
