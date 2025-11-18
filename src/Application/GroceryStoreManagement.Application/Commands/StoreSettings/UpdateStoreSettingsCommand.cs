using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.StoreSettings;

public class UpdateStoreSettingsCommand : IRequest<StoreSettingsDto>
{
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

