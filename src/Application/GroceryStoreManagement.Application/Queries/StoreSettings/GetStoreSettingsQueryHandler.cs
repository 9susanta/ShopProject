using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;
using StoreSettingsEntity = GroceryStoreManagement.Domain.Entities.StoreSettings;

namespace GroceryStoreManagement.Application.Queries.StoreSettings;

public class GetStoreSettingsQueryHandler : IRequestHandler<GetStoreSettingsQuery, StoreSettingsDto?>
{
    private readonly IRepository<StoreSettingsEntity> _storeSettingsRepository;
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetStoreSettingsQueryHandler> _logger;

    public GetStoreSettingsQueryHandler(
        IRepository<StoreSettingsEntity> storeSettingsRepository,
        ICacheService cacheService,
        ILogger<GetStoreSettingsQueryHandler> logger)
    {
        _storeSettingsRepository = storeSettingsRepository;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<StoreSettingsDto?> Handle(GetStoreSettingsQuery request, CancellationToken cancellationToken)
    {
        const string cacheKey = "store:settings";

        var cached = await _cacheService.GetAsync<StoreSettingsDto>(cacheKey, cancellationToken);
        if (cached != null)
        {
            _logger.LogDebug("Cache hit for store settings");
            return cached;
        }

        _logger.LogDebug("Cache miss for store settings");

        var allSettings = await _storeSettingsRepository.GetAllAsync(cancellationToken);
        var settings = allSettings.FirstOrDefault();

        if (settings == null)
            return null;

        var result = new StoreSettingsDto
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

        // Cache for 1 hour (store settings don't change often)
        await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromHours(1), cancellationToken);

        return result;
    }
}

