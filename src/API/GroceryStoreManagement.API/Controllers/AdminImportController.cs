using GroceryStoreManagement.Application.Commands.Imports;
using GroceryStoreManagement.Application.Queries.Imports;
using GroceryStoreManagement.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GroceryStoreManagement.API.Controllers;

/// <summary>
/// Admin controller for managing bulk product imports
/// </summary>
[ApiController]
[Route("api/admin/imports")]
[Authorize(Roles = "Admin")]
public class AdminImportController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IImportService _importService;
    private readonly ILogger<AdminImportController> _logger;
    private const long MaxFileSize = 50 * 1024 * 1024; // 50MB

    public AdminImportController(
        IMediator mediator,
        IImportService importService,
        ILogger<AdminImportController> logger)
    {
        _mediator = mediator;
        _importService = importService;
        _logger = logger;
    }

    /// <summary>
    /// Upload and create an import job
    /// </summary>
    [HttpPost("upload")]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<ActionResult<Application.DTOs.ImportJobDto>> UploadFile(
        IFormFile file,
        [FromForm] bool createMissingCategories = false,
        [FromForm] string updateExistingBy = "None",
        [FromForm] bool generateBarcodeIfMissing = false,
        [FromForm] string? mappingJson = null,
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is required");

        if (file.Length > MaxFileSize)
            return BadRequest($"File size exceeds maximum limit of {MaxFileSize / 1024 / 1024}MB");

        var allowedExtensions = new[] { ".xlsx", ".json" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest("Only .xlsx and .json files are allowed");

        // Save file to temporary location
        var uploadsDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Imports");
        if (!Directory.Exists(uploadsDirectory))
            Directory.CreateDirectory(uploadsDirectory);

        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadsDirectory, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var fileType = fileExtension == ".xlsx" ? "Excel" : "JSON";

        var command = new CreateImportJobCommand
        {
            FileName = file.FileName,
            FilePath = filePath,
            FileType = fileType,
            MappingJson = mappingJson,
            CreateMissingCategories = createMissingCategories,
            UpdateExistingBy = Enum.Parse<Domain.Enums.UpdateExistingBy>(updateExistingBy),
            GenerateBarcodeIfMissing = generateBarcodeIfMissing
        };

        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Preview import file without committing
    /// </summary>
    [HttpPost("preview")]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<ActionResult<List<Dictionary<string, object>>>> PreviewFile(
        IFormFile file,
        [FromQuery] int maxRows = 10,
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is required");

        var allowedExtensions = new[] { ".xlsx", ".json" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest("Only .xlsx and .json files are allowed");

        // Save file temporarily
        var tempDirectory = Path.Combine(Path.GetTempPath(), "ImportPreview");
        if (!Directory.Exists(tempDirectory))
            Directory.CreateDirectory(tempDirectory);

        var tempFileName = $"{Guid.NewGuid()}{fileExtension}";
        var tempFilePath = Path.Combine(tempDirectory, tempFileName);

        try
        {
            using (var stream = new FileStream(tempFilePath, FileMode.Create))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            var fileType = fileExtension == ".xlsx" ? "Excel" : "JSON";
            var preview = await _importService.PreviewImportAsync(tempFilePath, fileType, maxRows, cancellationToken);
            return Ok(preview);
        }
        finally
        {
            // Clean up temp file
            if (System.IO.File.Exists(tempFilePath))
                System.IO.File.Delete(tempFilePath);
        }
    }

    /// <summary>
    /// Get import job status
    /// </summary>
    [HttpGet("{importJobId}")]
    public async Task<ActionResult<Application.DTOs.ImportJobDto>> GetImportJob(
        Guid importJobId,
        CancellationToken cancellationToken = default)
    {
        var query = new GetImportJobQuery { ImportJobId = importJobId };
        var result = await _mediator.Send(query, cancellationToken);

        if (result == null)
            return NotFound();

        return Ok(result);
    }
}

