using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

/// <summary>
/// Represents a batch of inventory with specific expiry date and purchase details
/// Used for FIFO/LIFO tracking and expiry management
/// </summary>
public class InventoryBatch : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Guid? PurchaseOrderId { get; private set; } // Optional - can be ad-hoc stock
    public Guid? GRNId { get; private set; } // Link to GRN that created this batch
    public int Quantity { get; private set; }
    public int AvailableQuantity { get; private set; } // Remaining quantity after sales/adjustments
    public decimal UnitCost { get; private set; } // Purchase cost per unit
    public DateTime? ExpiryDate { get; private set; }
    public string? BatchNumber { get; private set; } // Optional batch/lot number
    public DateTime ReceivedDate { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Navigation properties
    public virtual Product Product { get; private set; } = null!;
    public virtual PurchaseOrder? PurchaseOrder { get; private set; }
    public virtual GoodsReceiveNote? GoodsReceiveNote { get; private set; }

    private InventoryBatch() { } // EF Core

    public InventoryBatch(
        Guid productId,
        int quantity,
        decimal unitCost,
        DateTime receivedDate,
        DateTime? expiryDate = null,
        string? batchNumber = null,
        Guid? purchaseOrderId = null,
        Guid? grnId = null)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (unitCost < 0)
            throw new ArgumentException("Unit cost cannot be negative", nameof(unitCost));

        ProductId = productId;
        Quantity = quantity;
        AvailableQuantity = quantity;
        UnitCost = unitCost;
        ReceivedDate = receivedDate;
        ExpiryDate = expiryDate;
        BatchNumber = batchNumber;
        PurchaseOrderId = purchaseOrderId;
        GRNId = grnId;
        IsActive = true;
    }

    public void Consume(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (AvailableQuantity < quantity)
            throw new InvalidOperationException($"Insufficient available quantity. Available: {AvailableQuantity}, Requested: {quantity}");

        AvailableQuantity -= quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AdjustQuantity(int newQuantity)
    {
        if (newQuantity < 0)
            throw new ArgumentException("Quantity cannot be negative", nameof(newQuantity));

        var difference = newQuantity - AvailableQuantity;
        AvailableQuantity = newQuantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsExpiringSoon(int daysThreshold = 7)
    {
        if (ExpiryDate == null)
            return false;

        return ExpiryDate.Value <= DateTime.UtcNow.AddDays(daysThreshold) && 
               ExpiryDate.Value > DateTime.UtcNow;
    }

    public bool IsExpired()
    {
        if (ExpiryDate == null)
            return false;

        return ExpiryDate.Value < DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}

