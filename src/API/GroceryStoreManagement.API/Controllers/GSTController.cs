using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.GST;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/gst")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class GSTController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<GSTController> _logger;

    public GSTController(IMediator mediator, ILogger<GSTController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Export GSTR-1 (Sales) report
    /// </summary>
    [HttpGet("gstr1")]
    public async Task<IActionResult> ExportGSTR1(
        [FromQuery] DateTime fromDate,
        [FromQuery] DateTime toDate)
    {
        try
        {
            var command = new ExportGSTR1Command { FromDate = fromDate, ToDate = toDate };
            var excelData = await _mediator.Send(command);

            var fileName = $"GSTR1_{fromDate:yyyyMMdd}_{toDate:yyyyMMdd}.xlsx";
            return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting GSTR-1");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Export GSTR-2 (Purchases) report
    /// </summary>
    [HttpGet("gstr2")]
    public async Task<IActionResult> ExportGSTR2(
        [FromQuery] DateTime fromDate,
        [FromQuery] DateTime toDate)
    {
        try
        {
            var command = new ExportGSTR2Command { FromDate = fromDate, ToDate = toDate };
            var excelData = await _mediator.Send(command);

            var fileName = $"GSTR2_{fromDate:yyyyMMdd}_{toDate:yyyyMMdd}.xlsx";
            return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting GSTR-2");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

