using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Imports;

public class CreateImportJobCommandHandler : IRequestHandler<CreateImportJobCommand, ImportJobDto>
{
    private readonly IRepository<ImportJob> _importJobRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateImportJobCommandHandler> _logger;

    public CreateImportJobCommandHandler(
        IRepository<ImportJob> importJobRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateImportJobCommandHandler> logger)
    {
        _importJobRepository = importJobRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ImportJobDto> Handle(CreateImportJobCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating import job for file: {FileName}", request.FileName);

        var importJob = new ImportJob(
            request.FileName,
            request.FilePath,
            request.FileType,
            request.MappingJson,
            request.CreateMissingCategories,
            request.UpdateExistingBy,
            request.GenerateBarcodeIfMissing);

        await _importJobRepository.AddAsync(importJob, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Import job created: {ImportJobId}", importJob.Id);

        return new ImportJobDto
        {
            Id = importJob.Id,
            FileName = importJob.FileName,
            FileType = importJob.FileType,
            Status = importJob.Status.ToString(),
            TotalRows = importJob.TotalRows,
            ProcessedRows = importJob.ProcessedRows,
            SuccessfulRows = importJob.SuccessfulRows,
            FailedRows = importJob.FailedRows,
            CreatedAt = importJob.CreatedAt
        };
    }
}

