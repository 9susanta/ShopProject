using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Services;

public class PermissionService : IPermissionService
{
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<RolePermission> _rolePermissionRepository;
    private readonly IRepository<Permission> _permissionRepository;
    private readonly ILogger<PermissionService> _logger;

    public PermissionService(
        IRepository<User> userRepository,
        IRepository<RolePermission> rolePermissionRepository,
        IRepository<Permission> permissionRepository,
        ILogger<PermissionService> logger)
    {
        _userRepository = userRepository;
        _rolePermissionRepository = rolePermissionRepository;
        _permissionRepository = permissionRepository;
        _logger = logger;
    }

    public async Task<bool> HasPermissionAsync(Guid userId, string permissionName, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
            return false;

        // Get user's role permissions
        var rolePermissions = await _rolePermissionRepository.FindAsync(
            rp => rp.RoleName == user.Role.ToString(), cancellationToken);

        var permission = (await _permissionRepository.FindAsync(
            p => p.Name == permissionName, cancellationToken)).FirstOrDefault();

        if (permission == null)
            return false;

        return rolePermissions.Any(rp => rp.PermissionId == permission.Id);
    }

    public async Task<List<string>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
            return new List<string>();

        var rolePermissions = await _rolePermissionRepository.FindAsync(
            rp => rp.RoleName == user.Role.ToString(), cancellationToken);

        var permissionIds = rolePermissions.Select(rp => rp.PermissionId).Distinct().ToList();
        var permissions = permissionIds.Any()
            ? (await _permissionRepository.FindAsync(p => permissionIds.Contains(p.Id), cancellationToken)).ToList()
            : new List<Permission>();

        return permissions.Select(p => p.Name).ToList();
    }

    public async Task<List<string>> GetRolePermissionsAsync(string roleName, CancellationToken cancellationToken = default)
    {
        var rolePermissions = await _rolePermissionRepository.FindAsync(
            rp => rp.RoleName == roleName, cancellationToken);

        var permissionIds = rolePermissions.Select(rp => rp.PermissionId).Distinct().ToList();
        var permissions = permissionIds.Any()
            ? (await _permissionRepository.FindAsync(p => permissionIds.Contains(p.Id), cancellationToken)).ToList()
            : new List<Permission>();

        return permissions.Select(p => p.Name).ToList();
    }
}

