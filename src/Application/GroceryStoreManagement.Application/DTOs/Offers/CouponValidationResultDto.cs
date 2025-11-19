namespace GroceryStoreManagement.Application.DTOs;

public class CouponValidationResultDto
{
    public bool IsValid { get; set; }
    public OfferDto? Offer { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? ErrorMessage { get; set; }
}

