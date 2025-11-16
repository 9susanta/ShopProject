using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using UnitEntity = GroceryStoreManagement.Domain.Entities.Unit;

namespace GroceryStoreManagement.Infrastructure.Services;

public class MasterDataCacheService : IMasterDataCache
{
    private readonly IRepository<Category> _categoryRepository;
    private readonly IRepository<Supplier> _supplierRepository;
    private readonly IRepository<UnitEntity> _unitRepository;
    private readonly IRepository<TaxSlab> _taxSlabRepository;
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<MasterDataCacheService> _logger;
    private const string CategoriesKey = "MasterData_Categories";
    private const string SuppliersKey = "MasterData_Suppliers";
    private const string UnitsKey = "MasterData_Units";
    private const string TaxSlabsKey = "MasterData_TaxSlabs";
    private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(30);

    public MasterDataCacheService(
        IRepository<Category> categoryRepository,
        IRepository<Supplier> supplierRepository,
        IRepository<UnitEntity> unitRepository,
        IRepository<TaxSlab> taxSlabRepository,
        IMemoryCache memoryCache,
        ILogger<MasterDataCacheService> logger)
    {
        _categoryRepository = categoryRepository;
        _supplierRepository = supplierRepository;
        _unitRepository = unitRepository;
        _taxSlabRepository = taxSlabRepository;
        _memoryCache = memoryCache;
        _logger = logger;
    }

    public async Task<Dictionary<Guid, string>> GetCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _memoryCache.GetOrCreateAsync(CategoriesKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheExpiration;
            _logger.LogInformation("Loading categories into cache");
            var categories = await _categoryRepository.GetAllAsync(cancellationToken);
            return categories.ToDictionary(c => c.Id, c => c.Name);
        }) ?? new Dictionary<Guid, string>();
    }

    public async Task<Dictionary<Guid, string>> GetSuppliersAsync(CancellationToken cancellationToken = default)
    {
        return await _memoryCache.GetOrCreateAsync(SuppliersKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheExpiration;
            _logger.LogInformation("Loading suppliers into cache");
            var suppliers = await _supplierRepository.GetAllAsync(cancellationToken);
            return suppliers.ToDictionary(s => s.Id, s => s.Name);
        }) ?? new Dictionary<Guid, string>();
    }

    public async Task<Dictionary<Guid, string>> GetUnitsAsync(CancellationToken cancellationToken = default)
    {
        return await _memoryCache.GetOrCreateAsync(UnitsKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheExpiration;
            _logger.LogInformation("Loading units into cache");
            var units = await _unitRepository.GetAllAsync(cancellationToken);
            return units.ToDictionary(u => u.Id, u => u.Name);
        }) ?? new Dictionary<Guid, string>();
    }

    public async Task<Dictionary<Guid, decimal>> GetTaxSlabsAsync(CancellationToken cancellationToken = default)
    {
        return await _memoryCache.GetOrCreateAsync(TaxSlabsKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheExpiration;
            _logger.LogInformation("Loading tax slabs into cache");
            var taxSlabs = await _taxSlabRepository.GetAllAsync(cancellationToken);
            return taxSlabs.ToDictionary(t => t.Id, t => t.Rate);
        }) ?? new Dictionary<Guid, decimal>();
    }

    public async Task InvalidateCacheAsync(CancellationToken cancellationToken = default)
    {
        _memoryCache.Remove(CategoriesKey);
        _memoryCache.Remove(SuppliersKey);
        _memoryCache.Remove(UnitsKey);
        _memoryCache.Remove(TaxSlabsKey);
        _logger.LogInformation("Invalidated master data cache");
        await Task.CompletedTask;
    }
}

