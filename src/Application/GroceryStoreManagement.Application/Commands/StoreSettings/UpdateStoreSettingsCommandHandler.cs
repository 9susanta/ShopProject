using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using StoreSettingsEntity = GroceryStoreManagement.Domain.Entities.StoreSettings;

namespace GroceryStoreManagement.Application.Commands.StoreSettings;

public class UpdateStoreSettingsCommandHandler : IRequestHandler<UpdateStoreSettingsCommand, StoreSettingsDto>
{
    private readonly IRepository<StoreSettingsEntity> _storeSettingsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateStoreSettingsCommandHandler(
        IRepository<StoreSettingsEntity> storeSettingsRepository,
        IUnitOfWork unitOfWork)
    {
        _storeSettingsRepository = storeSettingsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<StoreSettingsDto> Handle(UpdateStoreSettingsCommand request, CancellationToken cancellationToken)
    {
        var allSettings = await _storeSettingsRepository.GetAllAsync(cancellationToken);
        var settings = allSettings.FirstOrDefault();

        if (settings == null)
        {
            // Create new settings if none exist
            settings = new StoreSettingsEntity(request.StoreName, request.GSTIN, request.Address);
            await _storeSettingsRepository.AddAsync(settings, cancellationToken);
        }
        else
        {
            // Update existing settings
            settings.Update(
                request.StoreName,
                request.GSTIN,
                request.Address,
                request.City,
                request.State,
                request.Pincode,
                request.Phone,
                request.Email);

            settings.UpdatePackingCharges(request.PackingCharges);
            settings.UpdateLoyaltySettings(request.PointsPerHundredRupees);
            settings.UpdateHomeDeliverySettings(request.IsHomeDeliveryEnabled, request.HomeDeliveryCharges);

            await _storeSettingsRepository.UpdateAsync(settings, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new StoreSettingsDto
        {
            Id = settings.Id,
            StoreName = settings.StoreName,
            GSTIN = settings.GSTIN,
            Address = settings.Address,
            City = settings.City,
            State = settings.State,
            Pincode = settings.Pincode,
            Phone = settings.Phone,
            Email = settings.Email,
            PackingCharges = settings.PackingCharges,
            IsHomeDeliveryEnabled = settings.IsHomeDeliveryEnabled,
            HomeDeliveryCharges = settings.HomeDeliveryCharges,
            PointsPerHundredRupees = settings.PointsPerHundredRupees
        };
    }
}

