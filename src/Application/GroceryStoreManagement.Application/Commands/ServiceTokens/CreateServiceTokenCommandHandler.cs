using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.ServiceTokens;

public class CreateServiceTokenCommandHandler : IRequestHandler<CreateServiceTokenCommand, ServiceTokenDto>
{
    private readonly IRepository<ServiceToken> _tokenRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateServiceTokenCommandHandler> _logger;

    public CreateServiceTokenCommandHandler(
        IRepository<ServiceToken> tokenRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateServiceTokenCommandHandler> logger)
    {
        _tokenRepository = tokenRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ServiceTokenDto> Handle(CreateServiceTokenCommand request, CancellationToken cancellationToken)
    {
        // Get the next token number for today
        var today = DateTime.UtcNow.Date;
        var todayTokens = await _tokenRepository.FindAsync(
            t => t.CreatedAt.Date == today,
            cancellationToken);

        var maxTokenNumber = todayTokens.Any() 
            ? todayTokens.Max(t => t.TokenNumber) 
            : 0;

        var tokenNumber = maxTokenNumber + 1;

        var token = new ServiceToken(
            tokenNumber,
            request.Type,
            request.CustomerId,
            request.CustomerName,
            request.CustomerPhone,
            request.Priority,
            request.Notes);

        await _tokenRepository.AddAsync(token, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service token created: {TokenNumber}, Type: {Type}", tokenNumber, request.Type);

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

