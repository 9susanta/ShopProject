using MediatR;

namespace GroceryStoreManagement.Domain.Events;

/// <summary>
/// Raised when goods are returned to supplier
/// </summary>
public class SupplierReturnEvent : INotification
{
    public Guid SupplierReturnId { get; }
    public string ReturnNumber { get; }
    public Guid SupplierId { get; }
    public Guid? GRNId { get; }
    public DateTime ReturnDate { get; }
    public decimal TotalAmount { get; }
    public string Reason { get; }
    public List<SupplierReturnItemDetail> Items { get; }

    public SupplierReturnEvent(
        Guid supplierReturnId,
        string returnNumber,
        Guid supplierId,
        Guid? grnId,
        DateTime returnDate,
        decimal totalAmount,
        string reason,
        List<SupplierReturnItemDetail> items)
    {
        SupplierReturnId = supplierReturnId;
        ReturnNumber = returnNumber;
        SupplierId = supplierId;
        GRNId = grnId;
        ReturnDate = returnDate;
        TotalAmount = totalAmount;
        Reason = reason;
        Items = items;
    }
}

public class SupplierReturnItemDetail
{
    public Guid ProductId { get; }
    public Guid? BatchId { get; }
    public int Quantity { get; }
    public decimal UnitCost { get; }
    public string Reason { get; }

    public SupplierReturnItemDetail(
        Guid productId,
        Guid? batchId,
        int quantity,
        decimal unitCost,
        string reason)
    {
        ProductId = productId;
        BatchId = batchId;
        Quantity = quantity;
        UnitCost = unitCost;
        Reason = reason;
    }
}

