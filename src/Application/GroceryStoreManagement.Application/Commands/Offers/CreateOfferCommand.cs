using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Commands.Offers;

public class CreateOfferCommand : IRequest<OfferDto>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public OfferType Type { get; set; }
    public decimal DiscountValue { get; set; }
    public int? MinQuantity { get; set; }
    public int? MaxQuantity { get; set; }
    public Guid? ProductId { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CouponCode { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}

