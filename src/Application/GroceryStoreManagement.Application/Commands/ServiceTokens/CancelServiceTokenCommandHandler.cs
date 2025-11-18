using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.ServiceTokens;

public class CancelServiceTokenCommandHandler : IRequestHandler<CancelServiceTokenCommand, ServiceTokenDto>
{
    private readonly IRepository<ServiceToken> _tokenRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CancelServiceTokenCommandHandler> _logger;

    public CancelServiceTokenCommandHandler(
        IRepository<ServiceToken> tokenRepository,
        IUnitOfWork unitOfWork,
        ILogger<CancelServiceTokenCommandHandler> logger)
    {
        _tokenRepository = tokenRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ServiceTokenDto> Handle(CancelServiceTokenCommand request, CancellationToken cancellationToken)
    {
        var token = await _tokenRepository.GetByIdAsync(request.TokenId, cancellationToken);
        if (token == null)
            throw new KeyNotFoundException($"Token with ID {request.TokenId} not found");

        token.Cancel(request.Reason);
        await _tokenRepository.UpdateAsync(token, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Token {TokenNumber} cancelled", token.TokenNumber);

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
            Priority = token.Priority,
            Notes = token.Notes,
        };
    }
}

