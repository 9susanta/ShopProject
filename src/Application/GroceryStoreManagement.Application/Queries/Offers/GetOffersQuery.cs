using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Offers;

public class GetOffersQuery : IRequest<List<OfferDto>>
{
    public bool? IsActive { get; set; }
    public bool? IsValid { get; set; } // Currently valid offers
    public Guid? ProductId { get; set; }
    public Guid? CategoryId { get; set; }
}

