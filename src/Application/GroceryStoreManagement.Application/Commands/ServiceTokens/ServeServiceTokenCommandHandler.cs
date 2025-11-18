using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.ServiceTokens;

public class ServeServiceTokenCommandHandler : IRequestHandler<ServeServiceTokenCommand, ServiceTokenDto>
{
    private readonly IRepository<ServiceToken> _tokenRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ServeServiceTokenCommandHandler> _logger;

    public ServeServiceTokenCommandHandler(
        IRepository<ServiceToken> tokenRepository,
        IRepository<User> userRepository,
        IUnitOfWork unitOfWork,
        ILogger<ServeServiceTokenCommandHandler> logger)
    {
        _tokenRepository = tokenRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ServiceTokenDto> Handle(ServeServiceTokenCommand request, CancellationToken cancellationToken)
    {
        var token = await _tokenRepository.GetByIdAsync(request.TokenId, cancellationToken);
        if (token == null)
            throw new KeyNotFoundException($"Token with ID {request.TokenId} not found");

        token.Serve(request.ServedByUserId, request.Notes);
        await _tokenRepository.UpdateAsync(token, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var servedBy = await _userRepository.GetByIdAsync(request.ServedByUserId, cancellationToken);

        _logger.LogInformation("Token {TokenNumber} served by user {UserId}", token.TokenNumber, request.ServedByUserId);

        var waitTime = token.ServedAt.HasValue && token.CreatedAt != default
            ? (int?)(token.ServedAt.Value - token.CreatedAt).TotalMinutes
            : null;

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
            ServedByUserName = servedBy?.Name,
            Priority = token.Priority,
            Notes = token.Notes,
            WaitTimeMinutes = waitTime,
        };
    }
}

