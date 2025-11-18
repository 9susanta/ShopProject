using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Offers;

public class ValidateCouponCommand : IRequest<CouponValidationResultDto>
{
    public string CouponCode { get; set; } = string.Empty;
    public List<Guid>? ProductIds { get; set; }
}

