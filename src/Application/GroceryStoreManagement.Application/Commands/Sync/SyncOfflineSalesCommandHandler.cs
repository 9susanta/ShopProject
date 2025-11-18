using MediatR;
using GroceryStoreManagement.Application.Commands.Sync;
using GroceryStoreManagement.Application.Commands.Sales;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Sync;

public class SyncOfflineSalesCommandHandler : IRequestHandler<SyncOfflineSalesCommand, SyncOfflineSalesResponse>
{
    private readonly IMediator _mediator;
    private readonly ILogger<SyncOfflineSalesCommandHandler> _logger;

    public SyncOfflineSalesCommandHandler(
        IMediator mediator,
        ILogger<SyncOfflineSalesCommandHandler> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<SyncOfflineSalesResponse> Handle(SyncOfflineSalesCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Syncing {Count} offline sales", request.Sales.Count);

        var response = new SyncOfflineSalesResponse
        {
            TotalReceived = request.Sales.Count,
            Results = new List<SyncedSaleResult>()
        };

        foreach (var offlineSale in request.Sales)
        {
            try
            {
                var createSaleCommand = new CreatePOSSaleCommand
                {
                    CustomerId = offlineSale.CustomerId,
                    CustomerPhone = offlineSale.CustomerPhone,
                    Items = offlineSale.Items.Select(i => new POSSaleItemCommand
                    {
                        ProductId = i.ProductId,
                        Quantity = i.Quantity,
                        OverridePrice = i.UnitPrice
                    }).ToList(),
                    PaymentMethod = Enum.Parse<PaymentMethod>(offlineSale.PaymentMethod),
                    CashAmount = offlineSale.CashAmount ?? 0,
                    UPIAmount = offlineSale.UpiAmount ?? 0,
                    CardAmount = offlineSale.CardAmount ?? 0,
                    PayLaterAmount = offlineSale.PayLaterAmount ?? 0,
                    DiscountAmount = offlineSale.DiscountAmount ?? 0,
                    LoyaltyPointsToRedeem = offlineSale.LoyaltyPointsRedeemed ?? 0,
                    CouponCode = offlineSale.CouponCode
                };

                var saleResult = await _mediator.Send(createSaleCommand, cancellationToken);

                response.Results.Add(new SyncedSaleResult
                {
                    OfflineId = offlineSale.OfflineId,
                    SaleId = saleResult.Id,
                    Success = true
                });
                response.SuccessCount++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to sync offline sale {OfflineId}", offlineSale.OfflineId);
                response.Results.Add(new SyncedSaleResult
                {
                    OfflineId = offlineSale.OfflineId,
                    Success = false,
                    ErrorMessage = ex.Message
                });
                response.FailureCount++;
            }
        }

        _logger.LogInformation("Sync completed: {SuccessCount} succeeded, {FailureCount} failed",
            response.SuccessCount, response.FailureCount);

        return response;
    }
}

