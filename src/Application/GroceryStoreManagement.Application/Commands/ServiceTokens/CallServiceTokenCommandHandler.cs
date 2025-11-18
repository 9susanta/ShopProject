using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.ServiceTokens;

public class CallServiceTokenCommandHandler : IRequestHandler<CallServiceTokenCommand, ServiceTokenDto>
{
    private readonly IRepository<ServiceToken> _tokenRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CallServiceTokenCommandHandler> _logger;

    public CallServiceTokenCommandHandler(
        IRepository<ServiceToken> tokenRepository,
        IRepository<User> userRepository,
        IUnitOfWork unitOfWork,
        ILogger<CallServiceTokenCommandHandler> logger)
    {
        _tokenRepository = tokenRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ServiceTokenDto> Handle(CallServiceTokenCommand request, CancellationToken cancellationToken)
    {
        var token = await _tokenRepository.GetByIdAsync(request.TokenId, cancellationToken);
        if (token == null)
            throw new KeyNotFoundException($"Token with ID {request.TokenId} not found");

        token.Call(request.ServedByUserId);
        await _tokenRepository.UpdateAsync(token, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var servedBy = await _userRepository.GetByIdAsync(request.ServedByUserId, cancellationToken);

        _logger.LogInformation("Token {TokenNumber} called by user {UserId}", token.TokenNumber, request.ServedByUserId);

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
            ServedByUserId = token.ServedByUserId,
            ServedByUserName = servedBy?.Name,
            Priority = token.Priority,
            Notes = token.Notes,
        };
    }
}

