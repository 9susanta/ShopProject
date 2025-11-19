using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.Print;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/print")]
[Authorize(Roles = "Admin,Staff,SuperAdmin")]
public class PrintController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<PrintController> _logger;

    public PrintController(IMediator mediator, ILogger<PrintController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Print receipt for a sale
    /// </summary>
    [HttpPost("receipt")]
    public async Task<ActionResult<object>> PrintReceipt([FromBody] PrintReceiptCommand command)
    {
        try
        {
            var success = await _mediator.Send(command);
            if (success)
            {
                return Ok(new { success = true, message = "Receipt printed successfully" });
            }
            return BadRequest(new { error = "Failed to print receipt" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error printing receipt");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Print receipt by sale ID
    /// </summary>
    [HttpPost("receipt/{saleId}")]
    public async Task<ActionResult<object>> PrintReceiptById(Guid saleId)
    {
        try
        {
            var command = new PrintReceiptCommand { SaleId = saleId };
            var success = await _mediator.Send(command);
            if (success)
            {
                return Ok(new { success = true, message = "Receipt printed successfully" });
            }
            return BadRequest(new { error = "Failed to print receipt" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error printing receipt");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Print barcode for a product
    /// </summary>
    [HttpPost("barcode")]
    public async Task<ActionResult<object>> PrintBarcode([FromBody] Application.Commands.Print.PrintBarcodeCommand command)
    {
        try
        {
            var success = await _mediator.Send(command);
            if (success)
            {
                return Ok(new { success = true, message = "Barcode printed successfully" });
            }
            return BadRequest(new { error = "Failed to print barcode" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error printing barcode");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

