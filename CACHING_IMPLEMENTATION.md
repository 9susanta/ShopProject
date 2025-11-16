# Caching Implementation

## Overview

A comprehensive in-memory caching solution has been implemented using `IMemoryCache` from Microsoft.Extensions.Caching.Memory to improve application performance by reducing database queries for frequently accessed data.

## Architecture

### Components

1. **ICacheService Interface** (`Application/Interfaces/ICacheService.cs`)
   - Abstraction for cache operations
   - Supports both reference types and value types
   - Pattern-based cache invalidation

2. **CacheService Implementation** (`Infrastructure/Services/CacheService.cs`)
   - In-memory cache using IMemoryCache
   - Thread-safe key tracking with ConcurrentDictionary
   - Configurable expiration policies
   - Pattern-based removal using regex

3. **CachedRepository** (`Infrastructure/Repositories/CachedRepository.cs`)
   - Optional caching decorator for repositories
   - Automatic cache invalidation on updates/deletes
   - Currently not used by default (can be enabled if needed)

## Cached Data

### Products
- **Cache Key Pattern**: `products:category:{categoryId}:active:{includeInactive}`
- **Expiration**: 10 minutes
- **Invalidation**: On product create/update/delete

### Customers
- **Cache Key Pattern**: `customer:phone:{phoneNumber}`
- **Expiration**: 15 minutes
- **Invalidation**: On customer update or sale completion

### Store Settings
- **Cache Key**: `store:settings`
- **Expiration**: 1 hour (rarely changes)
- **Invalidation**: On settings update

### Inventory
- **Cache Key Pattern**: `inventory:product:{productId}`
- **Expiration**: 5 minutes (changes frequently)
- **Invalidation**: On inventory updates, purchase received, sale completed

### Product by Barcode
- **Cache Key Pattern**: `product:barcode:{barcode}`
- **Expiration**: 30 minutes
- **Invalidation**: On product update

## Cache Invalidation Strategy

### Automatic Invalidation

1. **Product Operations**:
   - Create: Invalidates `products:*` and `repo:Product:*`
   - Update: Invalidates specific product and category caches
   - Delete: Invalidates all product-related caches

2. **Sale Operations**:
   - On sale completion: Invalidates customer cache and inventory caches for sold products

3. **Customer Operations**:
   - On customer update: Invalidates customer cache by phone

### Manual Invalidation

Use the CacheController endpoints:
- `DELETE /api/cache/clear?pattern={pattern}` - Clear by pattern
- `DELETE /api/cache/{key}` - Clear specific key

## Configuration

Cache settings in `appsettings.json`:

```json
{
  "Cache": {
    "SizeLimit": 2048,
    "DefaultExpirationMinutes": 15,
    "ProductCacheMinutes": 10,
    "CustomerCacheMinutes": 15,
    "StoreSettingsCacheHours": 1,
    "BarcodeCacheMinutes": 30
  }
}
```

## Usage Examples

### In Query Handlers

```csharp
public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDto?>
{
    private readonly ICacheService _cacheService;
    
    public async Task<ProductDto?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"product:id:{request.Id}";
        var cached = await _cacheService.GetAsync<ProductDto>(cacheKey, cancellationToken);
        
        if (cached != null)
            return cached;
        
        // Fetch from database...
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        
        // Cache the result
        await _cacheService.SetAsync(cacheKey, productDto, TimeSpan.FromMinutes(10), cancellationToken);
        
        return productDto;
    }
}
```

### In Command Handlers (Invalidation)

```csharp
public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly ICacheService _cacheService;
    
    public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // Create product...
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Invalidate caches
        await _cacheService.RemoveByPatternAsync("products:*", cancellationToken);
        await _cacheService.RemoveByPatternAsync("repo:Product:*", cancellationToken);
        
        return productDto;
    }
}
```

## Cache Key Naming Convention

- **Repository caches**: `repo:{EntityName}:{operation}:{identifier}`
- **Query caches**: `{entity}:{operation}:{parameters}`
- **Specific lookups**: `{entity}:{field}:{value}`

Examples:
- `repo:Product:id:{guid}`
- `products:category:{categoryId}:active:true`
- `customer:phone:5550201`
- `product:barcode:1234567890123`
- `inventory:product:{productId}`

## Performance Benefits

1. **Reduced Database Load**: Frequently accessed data served from memory
2. **Faster Response Times**: Cache hits return in microseconds vs milliseconds
3. **Scalability**: Reduces database connection pool pressure
4. **Cost Efficiency**: Fewer database queries = lower infrastructure costs

## Monitoring

Cache operations are logged at Debug level:
- Cache hits: `Cache hit for key: {key}`
- Cache misses: `Cache miss for key: {key}`
- Cache sets: `Cache set for key: {key} with expiration: {expiration}`
- Cache removals: `Removed {count} cache entries matching pattern: {pattern}`

Enable Debug logging to monitor cache performance.

## Future Enhancements

1. **Distributed Caching**: Replace IMemoryCache with Redis for multi-instance scenarios
2. **Cache Statistics**: Add metrics for hit/miss ratios
3. **Cache Warming**: Pre-populate cache on application startup
4. **TTL Policies**: Different expiration policies based on data volatility
5. **Cache Compression**: For large objects

## Best Practices

1. **Cache Frequently Accessed, Rarely Changed Data**: Store settings, tax slabs, units
2. **Short TTL for Volatile Data**: Inventory (5 minutes), product prices (10 minutes)
3. **Long TTL for Static Data**: Store settings (1 hour), tax slabs (1 hour)
4. **Always Invalidate on Updates**: Ensure cache consistency
5. **Use Pattern-Based Invalidation**: Efficiently clear related caches
6. **Monitor Cache Size**: Adjust SizeLimit based on memory constraints

## Cache Controller Endpoints

### Clear Cache by Pattern
```
DELETE /api/cache/clear?pattern=products:*
```

### Clear Specific Cache Key
```
DELETE /api/cache/{key}
```

Example:
```
DELETE /api/cache/customer:phone:5550201
```

