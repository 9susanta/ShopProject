using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Queries.Accounting;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class AccountingController : ControllerBase
{
    private readonly IMediator _mediator;

    public AccountingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("daily-closing/{date:datetime}")]
    public async Task<ActionResult<DailyClosingSummaryDto>> GetDailyClosingSummary(DateTime date)
    {
        var query = new GetDailyClosingSummaryQuery { Date = date.Date };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("daily-closing")]
    public async Task<ActionResult<DailyClosingSummaryDto>> GetTodayClosingSummary()
    {
        var query = new GetDailyClosingSummaryQuery { Date = DateTime.Today };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}

