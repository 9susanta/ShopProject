using MediatR;

namespace GroceryStoreManagement.Application.Commands.Offers;

public class DeleteOfferCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

