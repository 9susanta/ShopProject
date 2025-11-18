using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

public class RolePermission : BaseEntity
{
    public string RoleName { get; private set; } = string.Empty;
    public Guid PermissionId { get; private set; }

    // Navigation properties
    public Permission Permission { get; private set; } = null!;

    private RolePermission() { } // For EF Core

    public RolePermission(string roleName, Guid permissionId)
    {
        if (string.IsNullOrWhiteSpace(roleName))
            throw new ArgumentException("Role name cannot be null or empty", nameof(roleName));

        RoleName = roleName;
        PermissionId = permissionId;
        CreatedAt = DateTime.UtcNow;
    }
}

