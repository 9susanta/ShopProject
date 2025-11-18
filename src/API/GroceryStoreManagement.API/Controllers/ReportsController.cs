using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Queries.Reports;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IMediator mediator, ILogger<ReportsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet("daily-sales")]
    public async Task<ActionResult<Application.DTOs.DailySalesReportDto>> GetDailySalesReport([FromQuery] DateTime? date = null)
    {
        var query = new GetDailySalesReportQuery { Date = date ?? DateTime.Today };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("gst-summary")]
    public async Task<ActionResult<Application.DTOs.GSTSummaryReportDto>> GetGSTSummaryReport(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var query = new GetGSTSummaryReportQuery
        {
            StartDate = startDate ?? DateTime.Today.AddDays(-30),
            EndDate = endDate ?? DateTime.Today
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("fast-moving")]
    public async Task<ActionResult<Application.DTOs.FastMovingProductsReportDto>> GetFastMovingProducts(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int topN = 20)
    {
        var query = new GetFastMovingProductsQuery
        {
            StartDate = startDate ?? DateTime.Today.AddDays(-30),
            EndDate = endDate ?? DateTime.Today,
            TopN = topN
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}

