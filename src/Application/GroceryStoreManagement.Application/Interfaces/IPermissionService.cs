namespace GroceryStoreManagement.Application.Interfaces;

public interface IPermissionService
{
    Task<bool> HasPermissionAsync(Guid userId, string permissionName, CancellationToken cancellationToken = default);
    Task<List<string>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<List<string>> GetRolePermissionsAsync(string roleName, CancellationToken cancellationToken = default);
}

