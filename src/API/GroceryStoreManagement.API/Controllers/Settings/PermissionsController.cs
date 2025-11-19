using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.Permissions;
using GroceryStoreManagement.Application.Queries.Permissions;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using System.Security.Claims;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/permissions")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class PermissionsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IPermissionService _permissionService;
    private readonly IRepository<Permission> _permissionRepository;
    private readonly IRepository<RolePermission> _rolePermissionRepository;
    private readonly ILogger<PermissionsController> _logger;

    public PermissionsController(
        IMediator mediator,
        IPermissionService permissionService,
        IRepository<Permission> permissionRepository,
        IRepository<RolePermission> rolePermissionRepository,
        ILogger<PermissionsController> logger)
    {
        _mediator = mediator;
        _permissionService = permissionService;
        _permissionRepository = permissionRepository;
        _rolePermissionRepository = rolePermissionRepository;
        _logger = logger;
    }

    /// <summary>
    /// Get all permissions
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<PermissionDto>>> GetPermissions()
    {
        var permissions = await _permissionRepository.GetAllAsync();
        var dtos = permissions.Select(p => new PermissionDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Category = p.Category,
            CreatedAt = p.CreatedAt
        }).ToList();
        return Ok(dtos);
    }

    /// <summary>
    /// Get permissions for a role
    /// </summary>
    [HttpGet("role/{roleName}")]
    public async Task<ActionResult<RolePermissionDto>> GetRolePermissions(string roleName)
    {
        var permissionNames = await _permissionService.GetRolePermissionsAsync(roleName);
        var permissions = (await _permissionRepository.FindAsync(p => permissionNames.Contains(p.Name))).ToList();
        
        var dto = new RolePermissionDto
        {
            RoleName = roleName,
            Permissions = permissions.Select(p => new PermissionDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Category = p.Category,
                CreatedAt = p.CreatedAt
            }).ToList()
        };
        return Ok(dto);
    }

    /// <summary>
    /// Get permissions for current user
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<List<string>>> GetMyPermissions()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var query = new GetUserPermissionsQuery { UserId = userId };
        var permissions = await _mediator.Send(query);
        return Ok(permissions);
    }

    /// <summary>
    /// Assign permission to role
    /// </summary>
    [HttpPost("assign")]
    public async Task<ActionResult<object>> AssignPermission([FromBody] AssignPermissionCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(new { success = result });
    }
}

