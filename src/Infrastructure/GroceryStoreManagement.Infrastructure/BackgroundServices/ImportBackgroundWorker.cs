using System.Data;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Application.Validation;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using GroceryStoreManagement.Domain.Events;
using GroceryStoreManagement.Infrastructure.Services;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using UnitEntity = GroceryStoreManagement.Domain.Entities.Unit;

namespace GroceryStoreManagement.Infrastructure.BackgroundServices;

public class ImportBackgroundWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ImportBackgroundWorker> _logger;
    private const int BatchSize = 200;
    private const int PollingIntervalSeconds = 10;

    public ImportBackgroundWorker(
        IServiceProvider serviceProvider,
        ILogger<ImportBackgroundWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Import Background Worker started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingJobsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Import Background Worker");
            }

            await Task.Delay(TimeSpan.FromSeconds(PollingIntervalSeconds), stoppingToken);
        }

        _logger.LogInformation("Import Background Worker stopped");
    }

    private async Task ProcessPendingJobsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var importJobRepository = scope.ServiceProvider.GetRequiredService<IRepository<ImportJob>>();
        var importErrorRepository = scope.ServiceProvider.GetRequiredService<IRepository<ImportError>>();
        var productRepository = scope.ServiceProvider.GetRequiredService<IRepository<Product>>();
        var categoryRepository = scope.ServiceProvider.GetRequiredService<IRepository<Category>>();
        var inventoryRepository = scope.ServiceProvider.GetRequiredService<IRepository<Inventory>>();
        var unitRepository = scope.ServiceProvider.GetRequiredService<IRepository<UnitEntity>>();
        var taxSlabRepository = scope.ServiceProvider.GetRequiredService<IRepository<TaxSlab>>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
        var excelParser = scope.ServiceProvider.GetRequiredService<IExcelParserService>();
        var jsonParser = scope.ServiceProvider.GetRequiredService<IJsonParserService>();
        var errorReportService = scope.ServiceProvider.GetRequiredService<IErrorReportService>();
        var validator = scope.ServiceProvider.GetRequiredService<ImportRowValidator>();
        var masterDataCache = scope.ServiceProvider.GetRequiredService<IMasterDataCache>();

        var pendingJobs = (await importJobRepository.FindAsync(j => j.Status == ImportJobStatus.Pending, cancellationToken))
            .ToList();

        foreach (var job in pendingJobs)
        {
            try
            {
                await ProcessJobAsync(
                    job,
                    importJobRepository,
                    importErrorRepository,
                    productRepository,
                    categoryRepository,
                    inventoryRepository,
                    unitRepository,
                    taxSlabRepository,
                    unitOfWork,
                    mediator,
                    excelParser,
                    jsonParser,
                    errorReportService,
                    validator,
                    masterDataCache,
                    cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing import job {JobId}", job.Id);
                job.Fail(ex.Message);
                await importJobRepository.UpdateAsync(job, cancellationToken);
                await unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }
    }

    private async Task ProcessJobAsync(
        ImportJob job,
        IRepository<ImportJob> importJobRepository,
        IRepository<ImportError> importErrorRepository,
        IRepository<Product> productRepository,
        IRepository<Category> categoryRepository,
        IRepository<Inventory> inventoryRepository,
        IRepository<UnitEntity> unitRepository,
        IRepository<TaxSlab> taxSlabRepository,
        IUnitOfWork unitOfWork,
        IMediator mediator,
        IExcelParserService excelParser,
        IJsonParserService jsonParser,
        IErrorReportService errorReportService,
        ImportRowValidator validator,
        IMasterDataCache masterDataCache,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing import job {JobId}", job.Id);

        job.StartProcessing();
        await importJobRepository.UpdateAsync(job, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Parse file
        List<Dictionary<string, object>> rows;
        if (job.FileType.Equals("Excel", StringComparison.OrdinalIgnoreCase) ||
            job.FileType.Equals("xlsx", StringComparison.OrdinalIgnoreCase))
        {
            rows = await excelParser.ParseAsync(job.FilePath, cancellationToken: cancellationToken);
        }
        else if (job.FileType.Equals("JSON", StringComparison.OrdinalIgnoreCase) ||
                 job.FileType.Equals("json", StringComparison.OrdinalIgnoreCase))
        {
            rows = await jsonParser.ParseAsync(job.FilePath, cancellationToken: cancellationToken);
        }
        else
        {
            throw new NotSupportedException($"File type {job.FileType} is not supported");
        }

        job.SetTotalRows(rows.Count);
        await importJobRepository.UpdateAsync(job, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var errors = new List<ImportErrorData>();
        int processedRows = 0;
        int successfulRows = 0;
        int failedRows = 0;

        // Process in batches
        for (int i = 0; i < rows.Count; i += BatchSize)
        {
            var batch = rows.Skip(i).Take(BatchSize).ToList();

            // Process batch within transaction to prevent race conditions
            await unitOfWork.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, cancellationToken);
            
            try
            {
                foreach (var row in batch)
                {
                    // Check cancellation token periodically
                    cancellationToken.ThrowIfCancellationRequested();
                    
                    processedRows++;
                    var rowNumber = i + batch.IndexOf(row) + 2; // +2 for header row and 0-based index

                    try
                    {
                        // Validate row
                        var validationResult = await validator.ValidateAsync(row, cancellationToken);
                        if (!validationResult.IsValid)
                        {
                            var errorMessage = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage));
                            errors.Add(new ImportErrorData
                            {
                                RowNumber = rowNumber,
                                Payload = System.Text.Json.JsonSerializer.Serialize(row),
                                ErrorMessage = errorMessage
                            });
                            failedRows++;
                            continue;
                        }

                        // Create or update product (within transaction to prevent duplicates)
                        await CreateOrUpdateProductAsync(
                            row,
                            job,
                            productRepository,
                            categoryRepository,
                            inventoryRepository,
                            unitRepository,
                            taxSlabRepository,
                            unitOfWork,
                            masterDataCache,
                            mediator,
                            cancellationToken);

                        successfulRows++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing row {RowNumber} in job {JobId}", rowNumber, job.Id);
                        errors.Add(new ImportErrorData
                        {
                            RowNumber = rowNumber,
                            Payload = System.Text.Json.JsonSerializer.Serialize(row),
                            ErrorMessage = ex.Message
                        });
                        failedRows++;
                    }
                }

                // Update progress
                job.UpdateProgress(processedRows, successfulRows, failedRows);
                await importJobRepository.UpdateAsync(job, cancellationToken);
                await unitOfWork.SaveChangesAsync(cancellationToken);
                await unitOfWork.CommitTransactionAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                await unitOfWork.RollbackTransactionAsync(cancellationToken);
                _logger.LogError(ex, "Error processing batch in job {JobId}", job.Id);
                throw;
            }
        }

        // Generate error report if there are errors
        string? errorReportPath = null;
        if (errors.Any())
        {
            var reportsDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Reports", "ImportErrors");
            errorReportPath = await errorReportService.GenerateCsvReportAsync(errors, reportsDirectory, cancellationToken);
        }

        // Save import errors
        foreach (var errorData in errors)
        {
            var importError = new ImportError(
                job.Id,
                errorData.RowNumber,
                errorData.Payload,
                errorData.ErrorMessage,
                errorData.FieldName);
            await importErrorRepository.AddAsync(importError, cancellationToken);
        }

        job.Complete(errorReportPath);
        await importJobRepository.UpdateAsync(job, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Completed import job {JobId}. Processed: {Processed}, Successful: {Successful}, Failed: {Failed}",
            job.Id, processedRows, successfulRows, failedRows);
    }

    private async Task CreateOrUpdateProductAsync(
        Dictionary<string, object> row,
        ImportJob job,
        IRepository<Product> productRepository,
        IRepository<Category> categoryRepository,
        IRepository<Inventory> inventoryRepository,
        IRepository<UnitEntity> unitRepository,
        IRepository<TaxSlab> taxSlabRepository,
        IUnitOfWork unitOfWork,
        IMasterDataCache masterDataCache,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        // Extract row data
        var name = GetStringValue(row, "Name");
        var sku = GetStringValue(row, "SKU") ?? GenerateSKU(name);
        var barcode = GetStringValue(row, "Barcode");
        var mrp = GetDecimalValue(row, "MRP") ?? GetDecimalValue(row, "Price") ?? 0;
        var salePrice = GetDecimalValue(row, "SalePrice") ?? mrp;
        var categoryName = GetStringValue(row, "Category");
        var unitName = GetStringValue(row, "Unit") ?? "Piece";
        var gstRate = GetDecimalValue(row, "GST") ?? GetDecimalValue(row, "GSTRate") ?? 0;
        var quantity = GetIntValue(row, "Quantity") ?? 0;
        var description = GetStringValue(row, "Description");

        // Find or create category
        var categories = await masterDataCache.GetCategoriesAsync(cancellationToken);
        var categoryId = categories.FirstOrDefault(c => c.Value.Equals(categoryName, StringComparison.OrdinalIgnoreCase)).Key;
        
        if (categoryId == Guid.Empty && job.CreateMissingCategories)
        {
            // Get default tax slab for new category
            var allTaxSlabs = await taxSlabRepository.GetAllAsync(cancellationToken);
            var defaultTaxSlab = allTaxSlabs.FirstOrDefault(ts => ts.IsDefault && ts.IsActive) 
                ?? allTaxSlabs.FirstOrDefault(ts => ts.IsActive);
            if (defaultTaxSlab == null)
                throw new InvalidOperationException("No active tax slab found for creating category");
            
            var newCategory = new Category(categoryName ?? "Uncategorized", defaultTaxSlab.Id);
            await categoryRepository.AddAsync(newCategory, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            categoryId = newCategory.Id;
            await masterDataCache.InvalidateCacheAsync(cancellationToken);
        }

        if (categoryId == Guid.Empty)
            throw new InvalidOperationException($"Category '{categoryName}' not found and createMissingCategories is false");

        // Find unit
        var units = await masterDataCache.GetUnitsAsync(cancellationToken);
        var unitId = units.FirstOrDefault(u => u.Value.Equals(unitName, StringComparison.OrdinalIgnoreCase)).Key;
        if (unitId == Guid.Empty)
        {
            // Default to first unit or create a default
            var allUnits = await unitRepository.GetAllAsync(cancellationToken);
            unitId = allUnits.FirstOrDefault()?.Id ?? Guid.Empty;
        }

        // Find tax slab by GST rate
        var taxSlabs = await masterDataCache.GetTaxSlabsAsync(cancellationToken);
        var taxSlabId = taxSlabs.FirstOrDefault(t => t.Value == gstRate).Key;
        if (taxSlabId == Guid.Empty)
        {
            // Default to first active tax slab
            var allTaxSlabs = await taxSlabRepository.GetAllAsync(cancellationToken);
            taxSlabId = allTaxSlabs.FirstOrDefault(ts => ts.IsActive)?.Id ?? Guid.Empty;
        }

        // Generate barcode if missing
        if (string.IsNullOrWhiteSpace(barcode) && job.GenerateBarcodeIfMissing)
        {
            barcode = $"BC{DateTime.UtcNow.Ticks}";
        }

        Product? product = null;
        bool isNewProduct = false;

        // Find existing product
        if (job.UpdateExistingBy == UpdateExistingBy.Barcode && !string.IsNullOrWhiteSpace(barcode))
        {
            var existingProducts = await productRepository.FindAsync(p => p.Barcode == barcode, cancellationToken);
            product = existingProducts.FirstOrDefault();
        }
        else if (job.UpdateExistingBy == UpdateExistingBy.SKU && !string.IsNullOrWhiteSpace(sku))
        {
            var existingProducts = await productRepository.FindAsync(p => p.SKU == sku, cancellationToken);
            product = existingProducts.FirstOrDefault();
        }

        if (product != null)
        {
            // Update existing product
            product.Update(name ?? "Unknown", mrp, salePrice, description, barcode, null);
            await productRepository.UpdateAsync(product, cancellationToken);
        }
        else
        {
            // Create new product
            isNewProduct = true;
            product = new Product(
                name ?? "Unknown",
                sku ?? $"SKU-{DateTime.UtcNow.Ticks}",
                mrp,
                salePrice,
                categoryId,
                unitId,
                description,
                barcode,
                null,
                10, // Default low stock threshold
                false, // isWeightBased
                null, // weightPerUnit
                taxSlabId); // taxSlabId (optional, will be auto-filled from category if null)

            await productRepository.AddAsync(product, cancellationToken);
        }

        // Create or update inventory
        var inventories = await inventoryRepository.FindAsync(i => i.ProductId == product.Id, cancellationToken);
        var inventory = inventories.FirstOrDefault();
        if (inventory == null)
        {
            inventory = new Inventory(product.Id, quantity);
            await inventoryRepository.AddAsync(inventory, cancellationToken);
        }
        else if (quantity > 0)
        {
            inventory.AddStock(quantity);
            await inventoryRepository.UpdateAsync(inventory, cancellationToken);
        }

        // Publish domain event
        await mediator.Publish(new ProductImportedEvent(
            product.Id,
            product.Name,
            product.SKU,
            product.Barcode,
            isNewProduct,
            job.Id), cancellationToken);
    }

    private string? GetStringValue(Dictionary<string, object> row, string key)
    {
        if (!row.ContainsKey(key))
            return null;

        var value = row[key];
        return value?.ToString()?.Trim();
    }

    private decimal? GetDecimalValue(Dictionary<string, object> row, string key)
    {
        var strValue = GetStringValue(row, key);
        if (string.IsNullOrWhiteSpace(strValue))
            return null;

        if (decimal.TryParse(strValue, out var result))
            return result;

        return null;
    }

    private int? GetIntValue(Dictionary<string, object> row, string key)
    {
        var strValue = GetStringValue(row, key);
        if (string.IsNullOrWhiteSpace(strValue))
            return null;

        if (int.TryParse(strValue, out var result))
            return result;

        return null;
    }

    private string GenerateSKU(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return $"SKU{DateTime.UtcNow.Ticks}";

        var sku = name.Replace(" ", "").ToUpperInvariant();
        return $"{sku}{DateTime.UtcNow.Ticks % 10000}";
    }
}

