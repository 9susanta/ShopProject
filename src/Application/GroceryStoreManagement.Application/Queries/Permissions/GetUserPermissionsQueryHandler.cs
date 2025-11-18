using MediatR;
using GroceryStoreManagement.Application.Interfaces;

namespace GroceryStoreManagement.Application.Queries.Permissions;

public class GetUserPermissionsQueryHandler : IRequestHandler<GetUserPermissionsQuery, List<string>>
{
    private readonly IPermissionService _permissionService;

    public GetUserPermissionsQueryHandler(IPermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    public async Task<List<string>> Handle(GetUserPermissionsQuery request, CancellationToken cancellationToken)
    {
        return await _permissionService.GetUserPermissionsAsync(request.UserId, cancellationToken);
    }
}

