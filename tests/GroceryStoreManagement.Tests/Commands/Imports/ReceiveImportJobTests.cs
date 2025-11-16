using GroceryStoreManagement.Application.Commands.Imports;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace GroceryStoreManagement.Tests.Commands.Imports;

public class ReceiveImportJobTests
{
    [Fact]
    public async Task ReceiveImportJob_Should_CreateImportJob()
    {
        // Arrange
        var mockRepository = new Mock<IRepository<ImportJob>>();
        var mockUnitOfWork = new Mock<IUnitOfWork>();
        var mockLogger = new Mock<ILogger<CreateImportJobCommandHandler>>();

        var handler = new CreateImportJobCommandHandler(
            mockRepository.Object,
            mockUnitOfWork.Object,
            mockLogger.Object);

        var command = new CreateImportJobCommand
        {
            FileName = "test.xlsx",
            FilePath = "/path/to/test.xlsx",
            FileType = "Excel",
            CreateMissingCategories = true,
            UpdateExistingBy = UpdateExistingBy.Barcode,
            GenerateBarcodeIfMissing = true
        };

        ImportJob? capturedJob = null;
        mockRepository.Setup(r => r.AddAsync(It.IsAny<ImportJob>(), It.IsAny<CancellationToken>()))
            .Callback<ImportJob, CancellationToken>((job, ct) => capturedJob = job)
            .ReturnsAsync((ImportJob job, CancellationToken ct) => job);

        mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(command.FileName, result.FileName);
        Assert.Equal(command.FileType, result.FileType);
        Assert.Equal("Pending", result.Status);
        Assert.NotNull(capturedJob);
        Assert.Equal(command.FileName, capturedJob.FileName);
        Assert.Equal(command.FilePath, capturedJob.FilePath);
        Assert.True(capturedJob.CreateMissingCategories);
        Assert.Equal(UpdateExistingBy.Barcode, capturedJob.UpdateExistingBy);
        Assert.True(capturedJob.GenerateBarcodeIfMissing);

        mockRepository.Verify(r => r.AddAsync(It.IsAny<ImportJob>(), It.IsAny<CancellationToken>()), Times.Once);
        mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}

