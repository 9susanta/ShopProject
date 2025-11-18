using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Offers;

public class GetOfferByIdQuery : IRequest<OfferDto?>
{
    public Guid Id { get; set; }
}

