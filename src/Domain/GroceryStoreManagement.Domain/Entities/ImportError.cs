using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

public class ImportError : BaseEntity
{
    public Guid ImportJobId { get; private set; }
    public int RowNumber { get; private set; }
    public string Payload { get; private set; } = string.Empty; // JSON representation of the row
    public string ErrorMessage { get; private set; } = string.Empty;
    public string? FieldName { get; private set; } // Which field caused the error

    // Navigation properties
    public virtual ImportJob ImportJob { get; private set; } = null!;

    private ImportError() { } // EF Core

    public ImportError(Guid importJobId, int rowNumber, string payload, string errorMessage, string? fieldName = null)
    {
        if (rowNumber <= 0)
            throw new ArgumentException("Row number must be greater than zero", nameof(rowNumber));

        if (string.IsNullOrWhiteSpace(errorMessage))
            throw new ArgumentException("Error message cannot be null or empty", nameof(errorMessage));

        ImportJobId = importJobId;
        RowNumber = rowNumber;
        Payload = payload;
        ErrorMessage = errorMessage;
        FieldName = fieldName;
    }
}

