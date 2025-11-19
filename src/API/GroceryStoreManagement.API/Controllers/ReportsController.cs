using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Queries.Reports;
using GroceryStoreManagement.Application.Queries.Inventory;
using GroceryStoreManagement.Application.Commands.Products;

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

    [HttpGet("slow-moving")]
    public async Task<ActionResult<Application.DTOs.SlowMovingProductsReportDto>> GetSlowMovingProducts(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int daysThreshold = 90,
        [FromQuery] int minDaysSinceLastSale = 30)
    {
        var query = new GetSlowMovingProductsQuery
        {
            FromDate = startDate,
            ToDate = endDate,
            DaysThreshold = daysThreshold,
            MinDaysSinceLastSale = minDaysSinceLastSale
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("reorder-suggestions")]
    public async Task<ActionResult> GetReorderSuggestions([FromQuery] bool onlyBelowReorderPoint = true)
    {
        var query = new GetReorderSuggestionsQuery { OnlyBelowReorderPoint = onlyBelowReorderPoint };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("item-wise-sales")]
    public async Task<ActionResult<Application.DTOs.ItemWiseSalesReportDto>> GetItemWiseSalesReport(
        [FromQuery] DateTime fromDate,
        [FromQuery] DateTime toDate,
        [FromQuery] Guid? productId = null,
        [FromQuery] Guid? categoryId = null)
    {
        var query = new GetItemWiseSalesReportQuery
        {
            FromDate = fromDate,
            ToDate = toDate,
            ProductId = productId,
            CategoryId = categoryId
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<Application.DTOs.LowStockReportDto>> GetLowStockReport([FromQuery] int? threshold = null)
    {
        var query = new GetLowStockReportQuery { Threshold = threshold };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("expiry")]
    public async Task<ActionResult<Application.DTOs.ExpiryReportDto>> GetExpiryReport([FromQuery] int days = 30)
    {
        var query = new GetExpiryReportQuery { DaysThreshold = days };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("purchase-summary")]
    public async Task<ActionResult<Application.DTOs.PurchaseSummaryReportDto>> GetPurchaseSummaryReport(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var query = new GetPurchaseSummaryReportQuery
        {
            StartDate = startDate,
            EndDate = endDate
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}

