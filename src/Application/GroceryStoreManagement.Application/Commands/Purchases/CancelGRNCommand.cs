using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Purchases;

public class CancelGRNCommand : IRequest<GRNDto>
{
    public Guid Id { get; set; }
}

