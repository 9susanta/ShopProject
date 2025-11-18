using MediatR;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Commands.Offers;

public class DeleteOfferCommandHandler : IRequestHandler<DeleteOfferCommand, bool>
{
    private readonly IRepository<Offer> _offerRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteOfferCommandHandler(
        IRepository<Offer> offerRepository,
        IUnitOfWork unitOfWork)
    {
        _offerRepository = offerRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteOfferCommand request, CancellationToken cancellationToken)
    {
        var offer = await _offerRepository.GetByIdAsync(request.Id, cancellationToken);
        if (offer == null)
            throw new KeyNotFoundException($"Offer with ID {request.Id} not found.");

        await _offerRepository.DeleteAsync(offer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}

