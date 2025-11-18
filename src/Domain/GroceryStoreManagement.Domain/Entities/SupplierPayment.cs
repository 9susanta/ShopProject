using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Domain.Entities;

public class SupplierPayment : BaseEntity
{
    public Guid SupplierId { get; private set; }
    public Guid? PurchaseOrderId { get; private set; }
    public Guid? GRNId { get; private set; }
    public decimal Amount { get; private set; }
    public PaymentMethod PaymentMethod { get; private set; }
    public DateTime PaymentDate { get; private set; }
    public string? ReferenceNumber { get; private set; }
    public string? Notes { get; private set; }
    public Guid CreatedBy { get; private set; }

    // Navigation properties
    public Supplier Supplier { get; private set; } = null!;
    public PurchaseOrder? PurchaseOrder { get; private set; }
    public GoodsReceiveNote? GoodsReceiveNote { get; private set; }

    private SupplierPayment() { } // For EF Core

    public SupplierPayment(
        Guid supplierId,
        decimal amount,
        PaymentMethod paymentMethod,
        DateTime paymentDate,
        Guid createdBy,
        Guid? purchaseOrderId = null,
        Guid? grnId = null,
        string? referenceNumber = null,
        string? notes = null)
    {
        Id = Guid.NewGuid();
        SupplierId = supplierId;
        Amount = amount;
        PaymentMethod = paymentMethod;
        PaymentDate = paymentDate;
        CreatedBy = createdBy;
        PurchaseOrderId = purchaseOrderId;
        GRNId = grnId;
        ReferenceNumber = referenceNumber;
        Notes = notes;
        CreatedAt = DateTime.UtcNow;
    }
}

