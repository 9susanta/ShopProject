using MediatR;
using GroceryStoreManagement.Application.Interfaces;

namespace GroceryStoreManagement.Application.Commands.GST;

public class ExportGSTR1CommandHandler : IRequestHandler<ExportGSTR1Command, byte[]>
{
    private readonly IGSTExportService _gstExportService;

    public ExportGSTR1CommandHandler(IGSTExportService gstExportService)
    {
        _gstExportService = gstExportService;
    }

    public async Task<byte[]> Handle(ExportGSTR1Command request, CancellationToken cancellationToken)
    {
        return await _gstExportService.ExportGSTR1Async(request.FromDate, request.ToDate, cancellationToken);
    }
}

