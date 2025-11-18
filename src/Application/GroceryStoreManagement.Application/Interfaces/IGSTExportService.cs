namespace GroceryStoreManagement.Application.Interfaces;

public interface IGSTExportService
{
    Task<byte[]> ExportGSTR1Async(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default);
    Task<byte[]> ExportGSTR2Async(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default);
}

