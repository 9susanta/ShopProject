using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.ServiceTokens;

public class GetServiceTokensQueryHandler : IRequestHandler<GetServiceTokensQuery, ServiceTokenListResponseDto>
{
    private readonly IRepository<ServiceToken> _tokenRepository;
    private readonly IRepository<User> _userRepository;
    private readonly ILogger<GetServiceTokensQueryHandler> _logger;

    public GetServiceTokensQueryHandler(
        IRepository<ServiceToken> tokenRepository,
        IRepository<User> userRepository,
        ILogger<GetServiceTokensQueryHandler> logger)
    {
        _tokenRepository = tokenRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<ServiceTokenListResponseDto> Handle(GetServiceTokensQuery request, CancellationToken cancellationToken)
    {
        var queryDate = request.Date?.Date ?? DateTime.UtcNow.Date;
        
        var allTokens = await _tokenRepository.FindAsync(
            t => t.CreatedAt.Date == queryDate,
            cancellationToken);

        var tokens = allTokens.AsQueryable();

        // Filter by status
        if (request.Status.HasValue)
        {
            tokens = tokens.Where(t => t.Status == request.Status.Value);
        }
        else if (!request.IncludeServed)
        {
            tokens = tokens.Where(t => t.Status != TokenStatus.Served && t.Status != TokenStatus.Cancelled);
        }

        // Filter by type
        if (request.Type.HasValue)
        {
            tokens = tokens.Where(t => t.Type == request.Type.Value);
        }

        // Order by priority (descending), then by creation time
        var orderedTokens = tokens
            .OrderByDescending(t => t.Priority)
            .ThenBy(t => t.CreatedAt)
            .ToList();

        // Load user names for served tokens
        var userIds = orderedTokens
            .Where(t => t.ServedByUserId.HasValue)
            .Select(t => t.ServedByUserId!.Value)
            .Distinct()
            .ToList();

        var users = userIds.Any()
            ? (await _userRepository.FindAsync(u => userIds.Contains(u.Id), cancellationToken)).ToList()
            : new List<User>();

        var userLookup = users.ToDictionary(u => u.Id);

        var tokenDtos = orderedTokens.Select(token =>
        {
            var waitTime = token.ServedAt.HasValue && token.CreatedAt != default
                ? (int?)(token.ServedAt.Value - token.CreatedAt).TotalMinutes
                : token.CalledAt.HasValue && token.CreatedAt != default
                    ? (int?)(token.CalledAt.Value - token.CreatedAt).TotalMinutes
                    : (int?)(DateTime.UtcNow - token.CreatedAt).TotalMinutes;

            return new ServiceTokenDto
            {
                Id = token.Id,
                TokenNumber = token.TokenNumber,
                CustomerId = token.CustomerId,
                CustomerName = token.CustomerName,
                CustomerPhone = token.CustomerPhone,
                Status = token.Status,
                Type = token.Type,
                CreatedAt = token.CreatedAt,
                CalledAt = token.CalledAt,
                ServedAt = token.ServedAt,
                ServedByUserId = token.ServedByUserId,
                ServedByUserName = token.ServedByUserId.HasValue && userLookup.ContainsKey(token.ServedByUserId.Value)
                    ? userLookup[token.ServedByUserId.Value].Name
                    : null,
                Priority = token.Priority,
                Notes = token.Notes,
                WaitTimeMinutes = waitTime,
            };
        }).ToList();

        var currentToken = tokenDtos.FirstOrDefault(t => t.Status == TokenStatus.Called);

        return new ServiceTokenListResponseDto
        {
            Items = tokenDtos,
            TotalCount = tokenDtos.Count,
            WaitingCount = tokenDtos.Count(t => t.Status == TokenStatus.Waiting),
            CalledCount = tokenDtos.Count(t => t.Status == TokenStatus.Called),
            CurrentToken = currentToken,
        };
    }
}

