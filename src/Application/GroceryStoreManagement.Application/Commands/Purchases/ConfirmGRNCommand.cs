using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Purchases;

public class ConfirmGRNCommand : IRequest<GRNDto>
{
    public Guid Id { get; set; }
    public string? IdempotencyKey { get; set; } // For idempotent confirmation
}

