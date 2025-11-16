using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Domain.Entities;

public class ImportJob : BaseEntity
{
    public string FileName { get; private set; } = string.Empty;
    public string FilePath { get; private set; } = string.Empty;
    public string FileType { get; private set; } = string.Empty; // Excel, JSON
    public ImportJobStatus Status { get; private set; } = ImportJobStatus.Pending;
    public int TotalRows { get; private set; }
    public int ProcessedRows { get; private set; }
    public int SuccessfulRows { get; private set; }
    public int FailedRows { get; private set; }
    public string? MappingJson { get; private set; } // Field mapping configuration
    public bool CreateMissingCategories { get; private set; }
    public UpdateExistingBy UpdateExistingBy { get; private set; } = UpdateExistingBy.None;
    public bool GenerateBarcodeIfMissing { get; private set; }
    public string? ErrorReportPath { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? ErrorMessage { get; private set; }

    // Navigation properties
    public virtual ICollection<ImportError> ImportErrors { get; private set; } = new List<ImportError>();

    private ImportJob() { } // EF Core

    public ImportJob(string fileName, string filePath, string fileType, string? mappingJson = null,
        bool createMissingCategories = false, UpdateExistingBy updateExistingBy = UpdateExistingBy.None,
        bool generateBarcodeIfMissing = false)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("File name cannot be null or empty", nameof(fileName));

        if (string.IsNullOrWhiteSpace(filePath))
            throw new ArgumentException("File path cannot be null or empty", nameof(filePath));

        FileName = fileName;
        FilePath = filePath;
        FileType = fileType;
        MappingJson = mappingJson;
        CreateMissingCategories = createMissingCategories;
        UpdateExistingBy = updateExistingBy;
        GenerateBarcodeIfMissing = generateBarcodeIfMissing;
        Status = ImportJobStatus.Pending;
    }

    public void StartProcessing()
    {
        if (Status != ImportJobStatus.Pending)
            throw new InvalidOperationException("Only pending jobs can be started");

        Status = ImportJobStatus.Processing;
        StartedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateProgress(int processedRows, int successfulRows, int failedRows)
    {
        if (Status != ImportJobStatus.Processing)
            throw new InvalidOperationException("Can only update progress for processing jobs");

        ProcessedRows = processedRows;
        SuccessfulRows = successfulRows;
        FailedRows = failedRows;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetTotalRows(int totalRows)
    {
        if (totalRows < 0)
            throw new ArgumentException("Total rows cannot be negative", nameof(totalRows));

        TotalRows = totalRows;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete(string? errorReportPath = null)
    {
        if (Status != ImportJobStatus.Processing)
            throw new InvalidOperationException("Only processing jobs can be completed");

        Status = ImportJobStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        ErrorReportPath = errorReportPath;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Fail(string errorMessage)
    {
        if (string.IsNullOrWhiteSpace(errorMessage))
            throw new ArgumentException("Error message is required", nameof(errorMessage));

        Status = ImportJobStatus.Failed;
        ErrorMessage = errorMessage;
        CompletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == ImportJobStatus.Completed)
            throw new InvalidOperationException("Cannot cancel a completed job");

        Status = ImportJobStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }
}

