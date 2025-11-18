using MediatR;

namespace GroceryStoreManagement.Application.Queries.Permissions;

public class GetUserPermissionsQuery : IRequest<List<string>>
{
    public Guid UserId { get; set; }
}

