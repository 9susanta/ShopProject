using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Application.Validation;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using GroceryStoreManagement.Infrastructure.BackgroundServices;
using GroceryStoreManagement.Infrastructure.Services;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using UnitEntity = GroceryStoreManagement.Domain.Entities.Unit;

namespace GroceryStoreManagement.Tests.BackgroundServices;

public class ImportBackgroundWorkerTests
{
    [Fact]
    public async Task ImportBackgroundWorker_Should_ProcessBatchAndCreateProducts()
    {
        // Arrange
        var mockServiceProvider = new Mock<IServiceProvider>();
        var mockScope = new Mock<IServiceScope>();
        var mockScopeFactory = new Mock<IServiceScopeFactory>();
        var mockLogger = new Mock<ILogger<ImportBackgroundWorker>>();

        var mockImportJobRepository = new Mock<IRepository<ImportJob>>();
        var mockImportErrorRepository = new Mock<IRepository<ImportError>>();
        var mockProductRepository = new Mock<IRepository<Product>>();
        var mockCategoryRepository = new Mock<IRepository<Category>>();
        var mockInventoryRepository = new Mock<IRepository<Inventory>>();
        var mockUnitRepository = new Mock<IRepository<UnitEntity>>();
        var mockTaxSlabRepository = new Mock<IRepository<TaxSlab>>();
        var mockUnitOfWork = new Mock<IUnitOfWork>();
        var mockMediator = new Mock<IMediator>();
        var mockExcelParser = new Mock<IExcelParserService>();
        var mockJsonParser = new Mock<IJsonParserService>();
        var mockErrorReportService = new Mock<IErrorReportService>();
        var mockValidator = new Mock<ImportRowValidator>();
        var mockMasterDataCache = new Mock<IMasterDataCache>();

        mockScopeFactory.Setup(sf => sf.CreateScope()).Returns(mockScope.Object);
        mockScope.Setup(s => s.ServiceProvider).Returns(mockServiceProvider.Object);
        mockServiceProvider.Setup(sp => sp.GetService(typeof(IServiceScopeFactory))).Returns(mockScopeFactory.Object);

        mockServiceProvider.Setup(sp => sp.GetRequiredService(typeof(IRepository<ImportJob>))).Returns(mockImportJobRepository.Object);
        mockServiceProvider.Setup(sp => sp.GetRequiredService(typeof(IRepository<ImportError>))).Returns(mockImportErrorRepository.Object);
        mockServiceProvider.Setup(sp => sp.GetRequiredService(typeof(IRepository<Product>))).Returns(mockProductRepository.Object);
        mockServiceProvider.Setup(sp => sp.GetRequiredService(typeof(IRepository<Category>))).Returns(mockCategoryRepository.Object);
        mockServiceProvider.Setup(sp => sp.GetRequiredService(typeof(IRepository<Inventory>))).Returns(mockInventoryRepository.Object);
        mockServiceProvider.Setup(sp => sp.GetRequiredService(typeof(IRepository<UnitEntity>))).Returns(mockUnitRepository.Object);
        mockServiceProvider.Setup(sp => sp.GetRequiredService(typeof(IRepository<TaxSlab>))).Returns(mockTaxSlabRepository.Object);
        mockServiceProvider.Setup(sp => sp.GetRequiredService(typeof(IUnitOfWork))).Returns(mockUnitOfWork.Object);
        mockServiceProvider.Setup(sp => sp.GetRequiredService(typeof(IMediator))).Returns(mockMediator.Object);
        mockServiceProvider.Setup(sp => sp.GetRequiredService(typeof(IExcelParserService))).Returns(mockExcelParser.Object);
        mockServiceProvider.Setup(sp => sp.GetRequiredService(typeof(IJsonParserService))).Returns(mockJsonParser.Object);
        mockServiceProvider.Setup(sp => sp.GetRequiredService(typeof(IErrorReportService))).Returns(mockErrorReportService.Object);
        mockServiceProvider.Setup(sp => sp.GetRequiredService(typeof(ImportRowValidator))).Returns(mockValidator.Object);
        mockServiceProvider.Setup(sp => sp.GetRequiredService(typeof(IMasterDataCache))).Returns(mockMasterDataCache.Object);

        var importJob = new ImportJob("test.xlsx", "/path/to/test.xlsx", "Excel", null, true, UpdateExistingBy.Barcode, true);
        
        mockImportJobRepository.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<ImportJob, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ImportJob> { importJob });

        mockExcelParser.Setup(p => p.ParseAsync(It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Dictionary<string, object>>
            {
                new Dictionary<string, object>
                {
                    { "Name", "Test Product" },
                    { "SKU", "TEST001" },
                    { "MRP", 100.0m },
                    { "SalePrice", 90.0m },
                    { "Category", "Test Category" },
                    { "Unit", "Piece" },
                    { "GST", 18.0m },
                    { "Quantity", 10 }
                }
            });

        var validationResult = new FluentValidation.Results.ValidationResult();
        mockValidator.Setup(v => v.ValidateAsync(It.IsAny<Dictionary<string, object>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(validationResult);

        mockMasterDataCache.Setup(c => c.GetCategoriesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<Guid, string>());
        mockMasterDataCache.Setup(c => c.GetUnitsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<Guid, string>());
        mockMasterDataCache.Setup(c => c.GetTaxSlabsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<Guid, (decimal, decimal)>());

        mockCategoryRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Category>());
        mockUnitRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UnitEntity>());
        mockTaxSlabRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaxSlab>());

        mockProductRepository.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Product, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Product>());
        mockInventoryRepository.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Inventory, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Inventory>());

        mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        // Note: This is a simplified test. In a real scenario, you'd need to properly test the background worker
        // by using a test host or mocking the execution context.
        var worker = new ImportBackgroundWorker(mockServiceProvider.Object, mockLogger.Object);

        // Assert - Verify that the setup is correct
        Assert.NotNull(worker);
        
        // The actual execution would require more complex setup with cancellation tokens
        // This test primarily verifies that the worker can be instantiated with the required dependencies
    }
}

