using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Interfaces;

public interface IImportService
{
    Task<Guid> CreateImportJobAsync(string fileName, string filePath, string fileType, 
        string? mappingJson, bool createMissingCategories, 
        UpdateExistingBy updateExistingBy, bool generateBarcodeIfMissing, 
        CancellationToken cancellationToken = default);
    
    Task<List<Dictionary<string, object>>> PreviewImportAsync(string filePath, string fileType, 
        int maxRows = 10, CancellationToken cancellationToken = default);
}

