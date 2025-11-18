namespace GroceryStoreManagement.Application.Interfaces;

public interface IPdfService
{
    /// <summary>
    /// Generate PDF invoice for a sale
    /// </summary>
    /// <param name="saleId">Sale ID</param>
    /// <param name="invoiceNumber">Invoice number</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>File path of generated PDF</returns>
    Task<string> GenerateInvoicePdfAsync(Guid saleId, string invoiceNumber, CancellationToken cancellationToken = default);
}

