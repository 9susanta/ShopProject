using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

public class StoreSettings : BaseEntity
{
    public string StoreName { get; private set; } = string.Empty;
    public string? GSTIN { get; private set; }
    public string? Address { get; private set; }
    public string? City { get; private set; }
    public string? State { get; private set; }
    public string? Pincode { get; private set; }
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public decimal PackingCharges { get; private set; } = 0;
    public bool IsHomeDeliveryEnabled { get; private set; } = false;
    public decimal HomeDeliveryCharges { get; private set; } = 0;
    public int PointsPerHundredRupees { get; private set; } = 1; // Default: 1 point per ₹100

    private StoreSettings() { } // EF Core

    public StoreSettings(string storeName, string? gstin = null, string? address = null)
    {
        if (string.IsNullOrWhiteSpace(storeName))
            throw new ArgumentException("Store name cannot be null or empty", nameof(storeName));

        StoreName = storeName;
        GSTIN = gstin;
        Address = address;
    }

    public void Update(string storeName, string? gstin = null, string? address = null, 
        string? city = null, string? state = null, string? pincode = null, 
        string? phone = null, string? email = null)
    {
        if (string.IsNullOrWhiteSpace(storeName))
            throw new ArgumentException("Store name cannot be null or empty", nameof(storeName));

        StoreName = storeName;
        GSTIN = gstin;
        Address = address;
        City = city;
        State = state;
        Pincode = pincode;
        Phone = phone;
        Email = email;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePackingCharges(decimal charges)
    {
        if (charges < 0)
            throw new ArgumentException("Packing charges cannot be negative", nameof(charges));

        PackingCharges = charges;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateLoyaltySettings(int pointsPerHundredRupees)
    {
        if (pointsPerHundredRupees < 0)
            throw new ArgumentException("Points per hundred rupees cannot be negative", nameof(pointsPerHundredRupees));

        PointsPerHundredRupees = pointsPerHundredRupees;
        UpdatedAt = DateTime.UtcNow;
    }
}

