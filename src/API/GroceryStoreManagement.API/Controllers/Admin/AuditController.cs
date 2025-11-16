using GroceryStoreManagement.Application.DTOs.Audit;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.API.Middlewares;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GroceryStoreManagement.API.Controllers.Admin;

/// <summary>
/// Admin controller for querying audit logs
/// </summary>
[ApiController]
[Route("api/admin/audits")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;
    private readonly ILogger<AuditController> _logger;

    public AuditController(IAuditService auditService, ILogger<AuditController> logger)
    {
        _auditService = auditService;
        _logger = logger;
    }

    /// <summary>
    /// Query audit logs with filters and pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<AuditLogQueryResult>> QueryAudits(
        [FromQuery] string? tableName = null,
        [FromQuery] string? operation = null,
        [FromQuery] Guid? userId = null,
        [FromQuery] string? correlationId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string sortBy = "TimestampUtc",
        [FromQuery] string sortDirection = "desc",
        CancellationToken cancellationToken = default)
    {
        var request = new AuditLogQueryRequest
        {
            TableName = tableName,
            Operation = operation,
            UserId = userId,
            CorrelationId = correlationId,
            FromDate = fromDate,
            ToDate = toDate,
            Page = page,
            PageSize = Math.Min(pageSize, 100), // Max 100 per page
            SortBy = sortBy,
            SortDirection = sortDirection
        };

        var result = await _auditService.QueryAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get a specific audit entry by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<AuditEntryDto>> GetAuditEntry(Guid id, CancellationToken cancellationToken = default)
    {
        var entry = await _auditService.GetByIdAsync(id, cancellationToken);
        if (entry == null)
        {
            return NotFound(new { message = "Audit entry not found" });
        }

        return Ok(entry);
    }
}

