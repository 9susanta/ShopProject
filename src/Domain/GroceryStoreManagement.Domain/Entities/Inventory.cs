using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

public class Inventory : BaseEntity
{
    public Guid ProductId { get; private set; }
    public int QuantityOnHand { get; private set; }
    public int ReservedQuantity { get; private set; }
    public int AvailableQuantity => QuantityOnHand - ReservedQuantity;
    public DateTime? ExpiryDate { get; private set; } // For expiry tracking
    public int? DamagedQuantity { get; private set; } = 0;

    // Navigation properties
    public virtual Product Product { get; private set; } = null!;

    private Inventory() { } // EF Core

    public Inventory(Guid productId, int initialQuantity = 0, DateTime? expiryDate = null)
    {
        ProductId = productId;
        QuantityOnHand = initialQuantity;
        ReservedQuantity = 0;
        ExpiryDate = expiryDate;
        DamagedQuantity = 0;
    }

    public void AddStock(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        QuantityOnHand += quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveStock(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (AvailableQuantity < quantity)
            throw new InvalidOperationException($"Insufficient stock. Available: {AvailableQuantity}, Requested: {quantity}");

        QuantityOnHand -= quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reserve(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (AvailableQuantity < quantity)
            throw new InvalidOperationException($"Insufficient available stock. Available: {AvailableQuantity}, Requested: {quantity}");

        ReservedQuantity += quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ReleaseReservation(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (ReservedQuantity < quantity)
            throw new InvalidOperationException($"Cannot release more than reserved. Reserved: {ReservedQuantity}, Requested: {quantity}");

        ReservedQuantity -= quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsLowStock(int threshold)
    {
        return AvailableQuantity <= threshold;
    }

    public bool IsExpiringSoon(int daysThreshold = 7)
    {
        if (ExpiryDate == null)
            return false;

        return ExpiryDate.Value <= DateTime.UtcNow.AddDays(daysThreshold) && ExpiryDate.Value > DateTime.UtcNow;
    }

    public bool IsExpired()
    {
        if (ExpiryDate == null)
            return false;

        return ExpiryDate.Value < DateTime.UtcNow;
    }

    public void MarkDamaged(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (AvailableQuantity < quantity)
            throw new InvalidOperationException($"Insufficient stock to mark as damaged. Available: {AvailableQuantity}, Requested: {quantity}");

        DamagedQuantity = (DamagedQuantity ?? 0) + quantity;
        QuantityOnHand -= quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AdjustExpiryDate(DateTime expiryDate)
    {
        ExpiryDate = expiryDate;
        UpdatedAt = DateTime.UtcNow;
    }
}

