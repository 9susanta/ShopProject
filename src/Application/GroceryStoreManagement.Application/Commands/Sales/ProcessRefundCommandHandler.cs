using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Sales;

public class ProcessRefundCommandHandler : IRequestHandler<ProcessRefundCommand, RefundDto>
{
    private readonly IRepository<Refund> _refundRepository;
    private readonly IRepository<SaleReturn> _saleReturnRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProcessRefundCommandHandler> _logger;

    public ProcessRefundCommandHandler(
        IRepository<Refund> refundRepository,
        IRepository<SaleReturn> saleReturnRepository,
        IRepository<User> userRepository,
        IUnitOfWork unitOfWork,
        ILogger<ProcessRefundCommandHandler> logger)
    {
        _refundRepository = refundRepository;
        _saleReturnRepository = saleReturnRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<RefundDto> Handle(ProcessRefundCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing refund for sale return: {SaleReturnId}", request.SaleReturnId);

        // Validate sale return exists and is approved
        var saleReturn = await _saleReturnRepository.GetByIdAsync(request.SaleReturnId, cancellationToken);
        if (saleReturn == null)
            throw new KeyNotFoundException($"Sale return with ID {request.SaleReturnId} not found");

        if (saleReturn.Status != Domain.Enums.ReturnStatus.Approved)
            throw new InvalidOperationException("Can only process refund for approved returns");

        if (saleReturn.Refund != null)
            throw new InvalidOperationException("Refund already processed for this return");

        // Validate refund amount matches return amount
        if (request.Amount != saleReturn.TotalRefundAmount)
            throw new InvalidOperationException($"Refund amount ({request.Amount}) must match return amount ({saleReturn.TotalRefundAmount})");

        // Create refund
        var refund = new Refund(
            request.SaleReturnId,
            request.Amount,
            request.PaymentMethod,
            request.TransactionId,
            request.ReferenceNumber,
            request.Notes);

        // Process refund (for now, auto-process; in production, integrate with payment gateway)
        refund.Process(Guid.Empty); // TODO: Get current user ID from context

        // Mark return as refunded
        saleReturn.MarkAsRefunded();

        // Save refund and update return
        await _refundRepository.AddAsync(refund, cancellationToken);
        await _saleReturnRepository.UpdateAsync(saleReturn, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Refund processed: {RefundId}, Amount: {Amount}", refund.Id, refund.Amount);

        // Map to DTO
        var processedBy = refund.ProcessedByUserId.HasValue
            ? await _userRepository.GetByIdAsync(refund.ProcessedByUserId.Value, cancellationToken)
            : null;

        return new RefundDto
        {
            Id = refund.Id,
            SaleReturnId = refund.SaleReturnId,
            Amount = refund.Amount,
            PaymentMethod = refund.PaymentMethod,
            Status = refund.Status,
            TransactionId = refund.TransactionId,
            ReferenceNumber = refund.ReferenceNumber,
            ProcessedAt = refund.ProcessedAt,
            ProcessedByUserId = refund.ProcessedByUserId,
            ProcessedByUserName = processedBy?.Name,
            Notes = refund.Notes,
            CreatedAt = refund.CreatedAt,
            UpdatedAt = refund.UpdatedAt
        };
    }
}


