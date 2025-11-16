namespace GroceryStoreManagement.Application.Interfaces;

public interface IMasterDataCache
{
    Task<Dictionary<Guid, string>> GetCategoriesAsync(CancellationToken cancellationToken = default);
    Task<Dictionary<Guid, string>> GetSuppliersAsync(CancellationToken cancellationToken = default);
    Task<Dictionary<Guid, string>> GetUnitsAsync(CancellationToken cancellationToken = default);
    Task<Dictionary<Guid, decimal>> GetTaxSlabsAsync(CancellationToken cancellationToken = default);
    Task InvalidateCacheAsync(CancellationToken cancellationToken = default);
}

