using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.Purchases;
using GroceryStoreManagement.Application.Queries.Purchases;
using GroceryStoreManagement.Application.Interfaces;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/purchasing/grn")]
[Authorize(Roles = "Admin,Staff")]
public class GRNController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<GRNController> _logger;

    public GRNController(
        IMediator mediator,
        IFileStorageService fileStorageService,
        ILogger<GRNController> logger)
    {
        _mediator = mediator;
        _fileStorageService = fileStorageService;
        _logger = logger;
    }

    /// <summary>
    /// Upload invoice file for GRN
    /// </summary>
    [HttpPost("upload-invoice")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<string>> UploadInvoice(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        if (file.Length > 10 * 1024 * 1024) // 10MB limit
            return BadRequest("File size exceeds 10MB limit");

        var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest("Invalid file type. Only PDF and image files are allowed.");

        using var stream = file.OpenReadStream();
        var filePath = await _fileStorageService.SaveFileAsync(stream, file.FileName, "invoices");
        var fileUrl = _fileStorageService.GetFileUrl(filePath);

        return Ok(new { filePath, fileUrl });
    }

    /// <summary>
    /// Create a new GRN (from PO or ad-hoc)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Application.DTOs.GRNDto>> CreateGRN([FromBody] CreateGRNCommand command)
    {
        var grn = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetGRN), new { id = grn.Id }, grn);
    }

    /// <summary>
    /// Get GRN by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Application.DTOs.GRNDto>> GetGRN(Guid id)
    {
        var query = new GetGRNByIdQuery { Id = id };
        var grn = await _mediator.Send(query);

        if (grn == null)
            return NotFound();

        return Ok(grn);
    }

    /// <summary>
    /// Get paginated list of GRNs with filters
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<GRNListResponseDto>> GetGRNs(
        [FromQuery] Guid? supplierId = null,
        [FromQuery] Guid? purchaseOrderId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? status = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetGRNsQuery
        {
            SupplierId = supplierId,
            PurchaseOrderId = purchaseOrderId,
            StartDate = startDate,
            EndDate = endDate,
            Status = status,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Confirm GRN and update stock (idempotent)
    /// </summary>
    [HttpPost("{id}/confirm")]
    public async Task<ActionResult<Application.DTOs.GRNDto>> ConfirmGRN(Guid id, [FromBody] ConfirmGRNCommand? command = null)
    {
        var confirmCommand = command ?? new ConfirmGRNCommand { Id = id };
        if (confirmCommand.Id != id)
            confirmCommand.Id = id;

        var grn = await _mediator.Send(confirmCommand);
        return Ok(grn);
    }

    /// <summary>
    /// Cancel/void a GRN
    /// </summary>
    [HttpPost("{id}/cancel")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Application.DTOs.GRNDto>> CancelGRN(Guid id)
    {
        var command = new CancelGRNCommand { Id = id };
        var grn = await _mediator.Send(command);
        return Ok(grn);
    }
}

