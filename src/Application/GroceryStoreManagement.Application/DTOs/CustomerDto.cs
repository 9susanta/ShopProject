using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.DTOs;

public class CustomerDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Pincode { get; set; }
    public int LoyaltyPoints { get; set; }
    public decimal PayLaterBalance { get; set; }
    public decimal PayLaterLimit { get; set; }
    public bool IsPayLaterEnabled { get; set; }
    public PaymentMethod? PreferredPaymentMethod { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? TotalOrders { get; set; }
    public decimal? TotalSpent { get; set; }
}

