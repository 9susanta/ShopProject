using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Queries.ServiceTokens;

public class GetServiceTokensQuery : IRequest<ServiceTokenListResponseDto>
{
    public TokenStatus? Status { get; set; }
    public TokenType? Type { get; set; }
    public DateTime? Date { get; set; }
    public bool IncludeServed { get; set; } = false;
}

