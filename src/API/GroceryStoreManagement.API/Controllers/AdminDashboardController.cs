using GroceryStoreManagement.Application.Queries.Dashboard;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GroceryStoreManagement.API.Controllers;

/// <summary>
/// Admin dashboard controller for KPIs and analytics
/// </summary>
[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Admin")]
public class AdminDashboardController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AdminDashboardController> _logger;

    public AdminDashboardController(IMediator mediator, ILogger<AdminDashboardController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get dashboard KPIs and summary data
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<Application.DTOs.DashboardDto>> GetDashboard(CancellationToken cancellationToken = default)
    {
        var query = new GetDashboardQuery();
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }
}

