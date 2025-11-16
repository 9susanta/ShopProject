using ClosedXML.Excel;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.Services;

public interface IExcelParserService
{
    Task<List<Dictionary<string, object>>> ParseAsync(string filePath, int? maxRows = null, CancellationToken cancellationToken = default);
}

public class ExcelParserService : IExcelParserService
{
    private readonly ILogger<ExcelParserService> _logger;

    public ExcelParserService(ILogger<ExcelParserService> logger)
    {
        _logger = logger;
    }

    public async Task<List<Dictionary<string, object>>> ParseAsync(string filePath, int? maxRows = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Parsing Excel file: {FilePath}", filePath);

        var rows = new List<Dictionary<string, object>>();

        await Task.Run(() =>
        {
            using var workbook = new XLWorkbook(filePath);
            var worksheet = workbook.Worksheet(1); // First worksheet

            var firstRow = worksheet.FirstRowUsed();
            if (firstRow == null)
                return;

            // Get headers from first row
            var headers = new List<string>();
            foreach (var cell in firstRow.CellsUsed())
            {
                headers.Add(cell.GetString().Trim());
            }

            if (headers.Count == 0)
                return;

            // Read data rows
            var dataRows = worksheet.RowsUsed().Skip(1); // Skip header row
            if (maxRows.HasValue)
                dataRows = dataRows.Take(maxRows.Value);

            foreach (var row in dataRows)
            {
                var rowData = new Dictionary<string, object>();
                for (int i = 0; i < headers.Count; i++)
                {
                    var cell = row.Cell(i + 1);
                    var value = cell.GetValue<object>();
                    rowData[headers[i]] = value ?? string.Empty;
                }
                rows.Add(rowData);
            }
        }, cancellationToken);

        _logger.LogInformation("Parsed {RowCount} rows from Excel file", rows.Count);
        return rows;
    }
}

