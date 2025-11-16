using MediatR;

namespace GroceryStoreManagement.Domain.Events;

/// <summary>
/// Raised when a GRN is confirmed and stock is updated
/// </summary>
public class GRNConfirmedEvent : INotification
{
    public Guid GRNId { get; }
    public string GRNNumber { get; }
    public Guid SupplierId { get; }
    public Guid? PurchaseOrderId { get; }
    public DateTime ConfirmedDate { get; }
    public decimal TotalAmount { get; }
    public List<GRNItemDetail> Items { get; }

    public GRNConfirmedEvent(
        Guid grnId,
        string grnNumber,
        Guid supplierId,
        Guid? purchaseOrderId,
        DateTime confirmedDate,
        decimal totalAmount,
        List<GRNItemDetail> items)
    {
        GRNId = grnId;
        GRNNumber = grnNumber;
        SupplierId = supplierId;
        PurchaseOrderId = purchaseOrderId;
        ConfirmedDate = confirmedDate;
        TotalAmount = totalAmount;
        Items = items;
    }
}

public class GRNItemDetail
{
    public Guid ProductId { get; }
    public int Quantity { get; }
    public decimal UnitCost { get; }
    public DateTime? ExpiryDate { get; }
    public string? BatchNumber { get; }

    public GRNItemDetail(
        Guid productId,
        int quantity,
        decimal unitCost,
        DateTime? expiryDate = null,
        string? batchNumber = null)
    {
        ProductId = productId;
        Quantity = quantity;
        UnitCost = unitCost;
        ExpiryDate = expiryDate;
        BatchNumber = batchNumber;
    }
}

