using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.ServiceTokens;

public class ServeServiceTokenCommand : IRequest<ServiceTokenDto>
{
    public Guid TokenId { get; set; }
    public Guid ServedByUserId { get; set; }
    public string? Notes { get; set; }
}

