using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Queries.Imports;

public class GetImportJobQueryHandler : IRequestHandler<GetImportJobQuery, ImportJobDto?>
{
    private readonly IRepository<ImportJob> _importJobRepository;

    public GetImportJobQueryHandler(IRepository<ImportJob> importJobRepository)
    {
        _importJobRepository = importJobRepository;
    }

    public async Task<ImportJobDto?> Handle(GetImportJobQuery request, CancellationToken cancellationToken)
    {
        var importJob = await _importJobRepository.GetByIdAsync(request.ImportJobId, cancellationToken);
        
        if (importJob == null)
            return null;

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
            ErrorReportPath = importJob.ErrorReportPath,
            CreatedAt = importJob.CreatedAt,
            StartedAt = importJob.StartedAt,
            CompletedAt = importJob.CompletedAt,
            ErrorMessage = importJob.ErrorMessage
        };
    }
}

