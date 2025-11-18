using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Offers;

public class GetApplicableOffersQuery : IRequest<List<OfferDto>>
{
    public List<Guid> ProductIds { get; set; } = new();
    public bool IncludeAutoApply { get; set; } = true;
    public bool IncludeCouponOnly { get; set; } = false;
}

