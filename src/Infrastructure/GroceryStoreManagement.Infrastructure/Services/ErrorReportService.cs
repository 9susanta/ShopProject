using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;
using System.Text;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.Services;

public interface IErrorReportService
{
    Task<string> GenerateCsvReportAsync(List<ImportErrorData> errors, string outputDirectory, CancellationToken cancellationToken = default);
}

public class ImportErrorData
{
    public int RowNumber { get; set; }
    public string Payload { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
    public string? FieldName { get; set; }
}

public class ErrorReportService : IErrorReportService
{
    private readonly ILogger<ErrorReportService> _logger;

    public ErrorReportService(ILogger<ErrorReportService> logger)
    {
        _logger = logger;
    }

    public async Task<string> GenerateCsvReportAsync(List<ImportErrorData> errors, string outputDirectory, CancellationToken cancellationToken = default)
    {
        if (!Directory.Exists(outputDirectory))
            Directory.CreateDirectory(outputDirectory);

        var fileName = $"ImportErrors_{DateTime.UtcNow:yyyyMMddHHmmss}.csv";
        var filePath = Path.Combine(outputDirectory, fileName);

        await Task.Run(() =>
        {
            using var writer = new StreamWriter(filePath, false, Encoding.UTF8);
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true
            };

            using var csv = new CsvWriter(writer, config);
            csv.WriteRecords(errors);
        }, cancellationToken);

        _logger.LogInformation("Generated error report: {FilePath}", filePath);
        return filePath;
    }
}

