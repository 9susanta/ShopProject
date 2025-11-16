using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Enums;
using GroceryStoreManagement.Infrastructure.Services;

namespace GroceryStoreManagement.Infrastructure.Services;

public class ImportService : IImportService
{
    private readonly IExcelParserService _excelParser;
    private readonly IJsonParserService _jsonParser;

    public ImportService(
        IExcelParserService excelParser,
        IJsonParserService jsonParser)
    {
        _excelParser = excelParser;
        _jsonParser = jsonParser;
    }

    public Task<Guid> CreateImportJobAsync(string fileName, string filePath, string fileType,
        string? mappingJson, bool createMissingCategories,
        UpdateExistingBy updateExistingBy, bool generateBarcodeIfMissing,
        CancellationToken cancellationToken = default)
    {
        // This is handled by the command handler, so this is just a pass-through
        // The actual implementation is in CreateImportJobCommandHandler
        throw new NotImplementedException("Use CreateImportJobCommand instead");
    }

    public async Task<List<Dictionary<string, object>>> PreviewImportAsync(string filePath, string fileType,
        int maxRows = 10, CancellationToken cancellationToken = default)
    {
        if (fileType.Equals("Excel", StringComparison.OrdinalIgnoreCase) ||
            fileType.Equals("xlsx", StringComparison.OrdinalIgnoreCase))
        {
            return await _excelParser.ParseAsync(filePath, maxRows, cancellationToken);
        }
        else if (fileType.Equals("JSON", StringComparison.OrdinalIgnoreCase) ||
                 fileType.Equals("json", StringComparison.OrdinalIgnoreCase))
        {
            return await _jsonParser.ParseAsync(filePath, maxRows, cancellationToken);
        }
        else
        {
            throw new NotSupportedException($"File type {fileType} is not supported");
        }
    }
}

