using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.Services;

public interface IJsonParserService
{
    Task<List<Dictionary<string, object>>> ParseAsync(string filePath, int? maxRows = null, CancellationToken cancellationToken = default);
}

public class JsonParserService : IJsonParserService
{
    private readonly ILogger<JsonParserService> _logger;

    public JsonParserService(ILogger<JsonParserService> logger)
    {
        _logger = logger;
    }

    public async Task<List<Dictionary<string, object>>> ParseAsync(string filePath, int? maxRows = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Parsing JSON file: {FilePath}", filePath);

        var jsonContent = await File.ReadAllTextAsync(filePath, cancellationToken);
        var jsonDocument = JsonDocument.Parse(jsonContent);

        var rows = new List<Dictionary<string, object>>();

        if (jsonDocument.RootElement.ValueKind == JsonValueKind.Array)
        {
            var items = jsonDocument.RootElement.EnumerateArray();
            int count = 0;
            foreach (var item in items)
            {
                if (maxRows.HasValue && count >= maxRows.Value)
                    break;

                var rowData = new Dictionary<string, object>();
                foreach (var property in item.EnumerateObject())
                {
                    rowData[property.Name] = property.Value.GetRawText().Trim('"');
                }
                rows.Add(rowData);
                count++;
            }
        }
        else if (jsonDocument.RootElement.ValueKind == JsonValueKind.Object)
        {
            // Single object, wrap in array
            var rowData = new Dictionary<string, object>();
            foreach (var property in jsonDocument.RootElement.EnumerateObject())
            {
                rowData[property.Name] = property.Value.GetRawText().Trim('"');
            }
            rows.Add(rowData);
        }

        _logger.LogInformation("Parsed {RowCount} rows from JSON file", rows.Count);
        return rows;
    }
}

