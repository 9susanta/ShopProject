using MediatR;

namespace GroceryStoreManagement.Application.Commands.GST;

public class ExportGSTR2Command : IRequest<byte[]>
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
}

