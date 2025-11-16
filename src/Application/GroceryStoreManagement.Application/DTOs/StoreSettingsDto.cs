namespace GroceryStoreManagement.Application.DTOs;

public class StoreSettingsDto
{
    public Guid Id { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public string? GSTIN { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public decimal PackingCharges { get; set; }
    public bool IsHomeDeliveryEnabled { get; set; }
    public decimal HomeDeliveryCharges { get; set; }
    public int PointsPerHundredRupees { get; set; }
}

