using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.ServiceTokens;

public class CancelServiceTokenCommand : IRequest<ServiceTokenDto>
{
    public Guid TokenId { get; set; }
    public string? Reason { get; set; }
}

