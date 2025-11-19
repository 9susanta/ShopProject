using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using GroceryStoreManagement.Application.Commands.ServiceTokens;
using GroceryStoreManagement.Application.Queries.ServiceTokens;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/service-tokens")]
[Authorize(Roles = "Admin,Staff,SuperAdmin")]
public class ServiceTokensController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<ServiceTokensController> _logger;

    public ServiceTokensController(IMediator mediator, ILogger<ServiceTokensController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get service tokens (queue)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<Application.DTOs.ServiceTokenListResponseDto>> GetTokens(
        [FromQuery] TokenStatus? status = null,
        [FromQuery] TokenType? type = null,
        [FromQuery] DateTime? date = null,
        [FromQuery] bool includeServed = false)
    {
        var query = new GetServiceTokensQuery
        {
            Status = status,
            Type = type,
            Date = date,
            IncludeServed = includeServed
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Create a new service token
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Application.DTOs.ServiceTokenDto>> CreateToken([FromBody] CreateServiceTokenCommand command)
    {
        var token = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetTokens), new { }, token);
    }

    /// <summary>
    /// Call a token (mark as called)
    /// </summary>
    [HttpPost("{id}/call")]
    public async Task<ActionResult<Application.DTOs.ServiceTokenDto>> CallToken(Guid id, [FromBody] CallServiceTokenCommand? command = null)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("User ID not found in token");
        }

        var callCommand = command ?? new CallServiceTokenCommand { TokenId = id };
        if (callCommand.TokenId != id)
            callCommand.TokenId = id;
        callCommand.ServedByUserId = userId;

        var token = await _mediator.Send(callCommand);
        return Ok(token);
    }

    /// <summary>
    /// Mark token as served
    /// </summary>
    [HttpPost("{id}/serve")]
    public async Task<ActionResult<Application.DTOs.ServiceTokenDto>> ServeToken(Guid id, [FromBody] ServeServiceTokenCommand? command = null)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("User ID not found in token");
        }

        var serveCommand = command ?? new ServeServiceTokenCommand { TokenId = id };
        if (serveCommand.TokenId != id)
            serveCommand.TokenId = id;
        serveCommand.ServedByUserId = userId;

        var token = await _mediator.Send(serveCommand);
        return Ok(token);
    }

    /// <summary>
    /// Cancel a token
    /// </summary>
    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<Application.DTOs.ServiceTokenDto>> CancelToken(Guid id, [FromBody] CancelServiceTokenCommand? command = null)
    {
        var cancelCommand = command ?? new CancelServiceTokenCommand { TokenId = id };
        if (cancelCommand.TokenId != id)
            cancelCommand.TokenId = id;

        var token = await _mediator.Send(cancelCommand);
        return Ok(token);
    }
}

