using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Commands.ServiceTokens;

public class CreateServiceTokenCommand : IRequest<ServiceTokenDto>
{
    public TokenType Type { get; set; } = TokenType.General;
    public Guid? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public int Priority { get; set; } = 0;
    public string? Notes { get; set; }
}

