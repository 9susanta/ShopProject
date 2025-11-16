using System.Linq.Expressions;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.Repositories;

public class CachedRepository<T> : IRepository<T> where T : BaseEntity
{
    private readonly Repository<T> _repository;
    private readonly ICacheService _cacheService;
    private readonly ILogger<CachedRepository<T>> _logger;
    private readonly string _cacheKeyPrefix;
    private readonly TimeSpan _cacheExpiration;

    public CachedRepository(
        ApplicationDbContext context,
        ICacheService cacheService,
        ILogger<CachedRepository<T>> logger,
        TimeSpan? cacheExpiration = null)
    {
        _repository = new Repository<T>(context);
        _cacheService = cacheService;
        _logger = logger;
        _cacheKeyPrefix = $"repo:{typeof(T).Name}:";
        _cacheExpiration = cacheExpiration ?? TimeSpan.FromMinutes(10);
    }

    public async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"{_cacheKeyPrefix}id:{id}";
        var cached = await _cacheService.GetAsync<T>(cacheKey, cancellationToken);
        
        if (cached != null)
            return cached;

        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        
        if (entity != null)
        {
            await _cacheService.SetAsync(cacheKey, entity, _cacheExpiration, cancellationToken);
        }

        return entity;
    }

    public async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var cacheKey = $"{_cacheKeyPrefix}all";
        var cached = await _cacheService.GetAsync<List<T>>(cacheKey, cancellationToken);
        
        if (cached != null)
            return cached;

        var entities = await _repository.GetAllAsync(cancellationToken);
        var entityList = entities.ToList();
        
        await _cacheService.SetAsync(cacheKey, entityList, _cacheExpiration, cancellationToken);
        
        return entityList;
    }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        // For find operations, we don't cache as the predicate can vary
        // But we can cache common queries if needed
        return await _repository.FindAsync(predicate, cancellationToken);
    }

    public async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        var result = await _repository.AddAsync(entity, cancellationToken);
        
        // Invalidate cache
        await InvalidateCacheAsync();
        
        return result;
    }

    public async Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _repository.UpdateAsync(entity, cancellationToken);
        
        // Invalidate specific entity cache and all cache
        var cacheKey = $"{_cacheKeyPrefix}id:{entity.Id}";
        await _cacheService.RemoveAsync(cacheKey);
        await InvalidateCacheAsync();
    }

    public async Task DeleteAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _repository.DeleteAsync(entity, cancellationToken);
        
        // Invalidate cache
        var cacheKey = $"{_cacheKeyPrefix}id:{entity.Id}";
        await _cacheService.RemoveAsync(cacheKey);
        await InvalidateCacheAsync();
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"{_cacheKeyPrefix}exists:{id}";
        var cached = await _cacheService.GetValueAsync<bool?>(cacheKey, cancellationToken);
        
        if (cached.HasValue)
            return cached.Value;

        var exists = await _repository.ExistsAsync(id, cancellationToken);
        
        // Store as object wrapper for value types
        await _cacheService.SetValueAsync(cacheKey, exists, TimeSpan.FromMinutes(5), cancellationToken);
        
        return exists;
    }

    private async Task InvalidateCacheAsync()
    {
        await _cacheService.RemoveByPatternAsync($"{_cacheKeyPrefix}*");
    }
}

