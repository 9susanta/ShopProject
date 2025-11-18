using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.DTOs;

public class OfferDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public OfferType Type { get; set; }
    public string TypeName => Type.ToString();
    public decimal DiscountValue { get; set; }
    public int? MinQuantity { get; set; }
    public int? MaxQuantity { get; set; }
    public Guid? ProductId { get; set; }
    public string? ProductName { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? CouponCode { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public bool IsValid => IsActive && DateTime.UtcNow >= StartDate && DateTime.UtcNow <= EndDate;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

