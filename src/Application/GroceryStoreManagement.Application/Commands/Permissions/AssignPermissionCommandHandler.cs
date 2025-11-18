using MediatR;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Permissions;

public class AssignPermissionCommandHandler : IRequestHandler<AssignPermissionCommand, bool>
{
    private readonly IRepository<RolePermission> _rolePermissionRepository;
    private readonly IRepository<Permission> _permissionRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AssignPermissionCommandHandler> _logger;

    public AssignPermissionCommandHandler(
        IRepository<RolePermission> rolePermissionRepository,
        IRepository<Permission> permissionRepository,
        IUnitOfWork unitOfWork,
        ILogger<AssignPermissionCommandHandler> logger)
    {
        _rolePermissionRepository = rolePermissionRepository;
        _permissionRepository = permissionRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<bool> Handle(AssignPermissionCommand request, CancellationToken cancellationToken)
    {
        var permission = await _permissionRepository.GetByIdAsync(request.PermissionId, cancellationToken);
        if (permission == null)
            throw new KeyNotFoundException($"Permission with ID {request.PermissionId} not found.");

        // Check if already assigned
        var existing = (await _rolePermissionRepository.FindAsync(
            rp => rp.RoleName == request.RoleName && rp.PermissionId == request.PermissionId,
            cancellationToken)).FirstOrDefault();

        if (existing != null)
            return true; // Already assigned

        var rolePermission = new RolePermission(request.RoleName, request.PermissionId);
        await _rolePermissionRepository.AddAsync(rolePermission, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Permission {PermissionName} assigned to role {RoleName}", permission.Name, request.RoleName);
        return true;
    }
}

