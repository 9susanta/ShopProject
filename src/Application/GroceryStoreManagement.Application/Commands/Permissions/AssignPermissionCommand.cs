using MediatR;

namespace GroceryStoreManagement.Application.Commands.Permissions;

public class AssignPermissionCommand : IRequest<bool>
{
    public string RoleName { get; set; } = string.Empty;
    public Guid PermissionId { get; set; }
}

