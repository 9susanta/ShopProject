using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Sync;

public class SyncOfflineSalesCommand : IRequest<SyncOfflineSalesResponse>
{
    public List<OfflineSaleData> Sales { get; set; } = new();
}

public class OfflineSaleData
{
    public string OfflineId { get; set; } = string.Empty;
    public Guid? CustomerId { get; set; }
    public string? CustomerPhone { get; set; }
    public List<OfflineSaleItemData> Items { get; set; } = new();
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal? CashAmount { get; set; }
    public decimal? UpiAmount { get; set; }
    public decimal? CardAmount { get; set; }
    public decimal? PayLaterAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public int? LoyaltyPointsRedeemed { get; set; }
    public string? CouponCode { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class OfflineSaleItemData
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class SyncOfflineSalesResponse
{
    public int TotalReceived { get; set; }
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public List<SyncedSaleResult> Results { get; set; } = new();
}

public class SyncedSaleResult
{
    public string OfflineId { get; set; } = string.Empty;
    public Guid? SaleId { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}



