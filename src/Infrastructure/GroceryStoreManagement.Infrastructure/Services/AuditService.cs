using System.Text.Json;
using GroceryStoreManagement.Application.DTOs.Audit;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Infrastructure.Persistence;
using GroceryStoreManagement.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.Services;

/// <summary>
/// Service for audit logging operations
/// </summary>
public class AuditService : IAuditService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuditService> _logger;
    private readonly HashSet<string> _maskedFields;

    public AuditService(
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<AuditService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;

        // Load masked field names from configuration
        var maskedFieldsConfig = _configuration.GetSection("Audit:MaskedFields").Get<string[]>() 
            ?? new[] { "Password", "PasswordHash", "RefreshToken", "TokenHash", "Secret", "ApiKey" };
        _maskedFields = new HashSet<string>(maskedFieldsConfig, StringComparer.OrdinalIgnoreCase);
    }

    public async Task AddAsync(CreateAuditEntryDto entryDto, CancellationToken cancellationToken = default)
    {
        try
        {
            // Mask sensitive fields
            var maskedOldValues = MaskSensitiveFields(entryDto.OldValues, entryDto.TableName);
            var maskedNewValues = MaskSensitiveFields(entryDto.NewValues, entryDto.TableName);

            var entry = new AuditEntry
            {
                TableName = entryDto.TableName,
                KeyValues = entryDto.KeyValues,
                Operation = entryDto.Operation,
                OldValues = maskedOldValues,
                NewValues = maskedNewValues,
                UserId = entryDto.UserId,
                UserName = entryDto.UserName,
                CorrelationId = entryDto.CorrelationId,
                RequestPath = entryDto.RequestPath,
                ClientIp = entryDto.ClientIp,
                Metadata = entryDto.Metadata,
                TimestampUtc = DateTime.UtcNow
            };

            await _context.Set<AuditEntry>().AddAsync(entry, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to add audit entry for table {TableName}", entryDto.TableName);
            // Don't throw - audit failures shouldn't break the main operation
        }
    }

    public async Task AddRangeAsync(IEnumerable<CreateAuditEntryDto> entries, CancellationToken cancellationToken = default)
    {
        try
        {
            var entryList = entries.Select(entryDto =>
            {
                var maskedOldValues = MaskSensitiveFields(entryDto.OldValues, entryDto.TableName);
                var maskedNewValues = MaskSensitiveFields(entryDto.NewValues, entryDto.TableName);

                return new AuditEntry
                {
                    TableName = entryDto.TableName,
                    KeyValues = entryDto.KeyValues,
                    Operation = entryDto.Operation,
                    OldValues = maskedOldValues,
                    NewValues = maskedNewValues,
                    UserId = entryDto.UserId,
                    UserName = entryDto.UserName,
                    CorrelationId = entryDto.CorrelationId,
                    RequestPath = entryDto.RequestPath,
                    ClientIp = entryDto.ClientIp,
                    Metadata = entryDto.Metadata,
                    TimestampUtc = DateTime.UtcNow
                };
            }).ToList();

            await _context.Set<AuditEntry>().AddRangeAsync(entryList, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to add audit entries");
            // Don't throw - audit failures shouldn't break the main operation
        }
    }

    public async Task<AuditLogQueryResult> QueryAsync(AuditLogQueryRequest request, CancellationToken cancellationToken = default)
    {
        var query = _context.Set<AuditEntry>().AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.TableName))
        {
            query = query.Where(a => a.TableName == request.TableName);
        }

        if (!string.IsNullOrWhiteSpace(request.Operation))
        {
            query = query.Where(a => a.Operation == request.Operation);
        }

        if (request.UserId.HasValue)
        {
            query = query.Where(a => a.UserId == request.UserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.CorrelationId))
        {
            query = query.Where(a => a.CorrelationId == request.CorrelationId);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(a => a.TimestampUtc >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(a => a.TimestampUtc <= request.ToDate.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        query = request.SortDirection.ToLower() == "asc"
            ? request.SortBy.ToLower() switch
            {
                "tablename" => query.OrderBy(a => a.TableName),
                "operation" => query.OrderBy(a => a.Operation),
                "username" => query.OrderBy(a => a.UserName),
                "timestamputc" => query.OrderBy(a => a.TimestampUtc),
                _ => query.OrderBy(a => a.TimestampUtc)
            }
            : request.SortBy.ToLower() switch
            {
                "tablename" => query.OrderByDescending(a => a.TableName),
                "operation" => query.OrderByDescending(a => a.Operation),
                "username" => query.OrderByDescending(a => a.UserName),
                "timestamputc" => query.OrderByDescending(a => a.TimestampUtc),
                _ => query.OrderByDescending(a => a.TimestampUtc)
            };

        // Apply pagination
        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new AuditEntryDto
            {
                Id = a.Id,
                TableName = a.TableName,
                KeyValues = a.KeyValues,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                Operation = a.Operation,
                UserId = a.UserId,
                UserName = a.UserName,
                CorrelationId = a.CorrelationId,
                RequestPath = a.RequestPath,
                ClientIp = a.ClientIp,
                TimestampUtc = a.TimestampUtc,
                Metadata = a.Metadata
            })
            .ToListAsync(cancellationToken);

        return new AuditLogQueryResult
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    public async Task<AuditEntryDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entry = await _context.Set<AuditEntry>()
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (entry == null)
            return null;

        return new AuditEntryDto
        {
            Id = entry.Id,
            TableName = entry.TableName,
            KeyValues = entry.KeyValues,
            OldValues = entry.OldValues,
            NewValues = entry.NewValues,
            Operation = entry.Operation,
            UserId = entry.UserId,
            UserName = entry.UserName,
            CorrelationId = entry.CorrelationId,
            RequestPath = entry.RequestPath,
            ClientIp = entry.ClientIp,
            TimestampUtc = entry.TimestampUtc,
            Metadata = entry.Metadata
        };
    }

    public string MaskSensitiveFields(string? jsonData, string tableName)
    {
        if (string.IsNullOrWhiteSpace(jsonData))
            return jsonData ?? string.Empty;

        try
        {
            using var doc = JsonDocument.Parse(jsonData);
            var root = doc.RootElement;

            if (root.ValueKind != JsonValueKind.Object)
                return jsonData;

            var masked = new Dictionary<string, object?>();
            foreach (var prop in root.EnumerateObject())
            {
                if (_maskedFields.Contains(prop.Name))
                {
                    masked[prop.Name] = "***MASKED***";
                }
                else
                {
                    masked[prop.Name] = prop.Value.GetRawText();
                }
            }

            return JsonSerializer.Serialize(masked);
        }
        catch
        {
            // If JSON parsing fails, return original (might be plain text)
            return jsonData;
        }
    }
}

