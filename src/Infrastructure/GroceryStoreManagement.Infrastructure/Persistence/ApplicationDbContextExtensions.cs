using System.Text.Json;
using GroceryStoreManagement.Application.DTOs.Audit;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.Persistence;

/// <summary>
/// Extension methods for ApplicationDbContext to intercept SaveChanges and create audit entries
/// </summary>
public static class ApplicationDbContextExtensions
{
    /// <summary>
    /// Intercept SaveChangesAsync to create audit entries for entity changes
    /// Call this method before SaveChangesAsync in your DbContext
    /// </summary>
    public static async Task<int> SaveChangesWithAuditAsync(
        this ApplicationDbContext context,
        IServiceProvider serviceProvider,
        string? correlationId = null,
        Guid? userId = null,
        string? userName = null,
        string? requestPath = null,
        string? clientIp = null,
        CancellationToken cancellationToken = default)
    {
        var auditService = serviceProvider.GetService<IAuditService>();
        var logger = serviceProvider.GetService<ILogger<ApplicationDbContext>>();

        if (auditService == null)
        {
            // If audit service is not available, just save changes normally
            return await context.SaveChangesAsync(cancellationToken);
        }

        var auditEntries = new List<CreateAuditEntryDto>();
        var entries = context.ChangeTracker.Entries()
            .Where(e => e.Entity is BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted))
            .ToList();

        foreach (var entry in entries)
        {
            var entity = entry.Entity as BaseEntity;
            if (entity == null) continue;

            var tableName = entry.Entity.GetType().Name;
            var operation = entry.State switch
            {
                EntityState.Added => "Create",
                EntityState.Modified => "Update",
                EntityState.Deleted => "Delete",
                _ => "Unknown"
            };

            // Get primary key values
            var keyValues = GetKeyValues(entry);
            var keyValuesJson = JsonSerializer.Serialize(keyValues);

            // Get old and new values
            string? oldValues = null;
            string? newValues = null;

            if (entry.State == EntityState.Modified || entry.State == EntityState.Deleted)
            {
                var originalValues = new Dictionary<string, object?>();
                foreach (var property in entry.Properties)
                {
                    if (property.IsModified || entry.State == EntityState.Deleted)
                    {
                        originalValues[property.Metadata.Name] = property.OriginalValue;
                    }
                }
                oldValues = JsonSerializer.Serialize(originalValues);
            }

            if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
            {
                var currentValues = new Dictionary<string, object?>();
                foreach (var property in entry.Properties)
                {
                    if (property.IsModified || entry.State == EntityState.Added)
                    {
                        currentValues[property.Metadata.Name] = property.CurrentValue;
                    }
                }
                newValues = JsonSerializer.Serialize(currentValues);
            }

            var auditEntry = new CreateAuditEntryDto
            {
                TableName = tableName,
                KeyValues = keyValuesJson,
                OldValues = oldValues,
                NewValues = newValues,
                Operation = operation,
                UserId = userId,
                UserName = userName,
                CorrelationId = correlationId,
                RequestPath = requestPath,
                ClientIp = clientIp
            };

            auditEntries.Add(auditEntry);
        }

        // Save changes first
        var result = await context.SaveChangesAsync(cancellationToken);

        // Then add audit entries (in a separate transaction or same transaction)
        if (auditEntries.Any())
        {
            try
            {
                await auditService.AddRangeAsync(auditEntries, cancellationToken);
            }
            catch (Exception ex)
            {
                logger?.LogError(ex, "Failed to create audit entries");
                // Don't throw - audit failures shouldn't break the main operation
            }
        }

        return result;
    }

    private static Dictionary<string, object?> GetKeyValues(EntityEntry entry)
    {
        var keyValues = new Dictionary<string, object?>();
        var key = entry.Metadata.FindPrimaryKey();
        if (key != null)
        {
            foreach (var property in key.Properties)
            {
                keyValues[property.Name] = entry.Property(property.Name).CurrentValue;
            }
        }
        return keyValues;
    }
}

