using MediatR;
using GroceryStoreManagement.Application.Interfaces;

namespace GroceryStoreManagement.Application.Commands.GST;

public class ExportGSTR2CommandHandler : IRequestHandler<ExportGSTR2Command, byte[]>
{
    private readonly IGSTExportService _gstExportService;

    public ExportGSTR2CommandHandler(IGSTExportService gstExportService)
    {
        _gstExportService = gstExportService;
    }

    public async Task<byte[]> Handle(ExportGSTR2Command request, CancellationToken cancellationToken)
    {
        return await _gstExportService.ExportGSTR2Async(request.FromDate, request.ToDate, cancellationToken);
    }
}

