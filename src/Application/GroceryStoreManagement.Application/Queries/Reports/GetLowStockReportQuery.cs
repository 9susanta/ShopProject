using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Reports;

public class GetLowStockReportQuery : IRequest<LowStockReportDto>
{
    public int? Threshold { get; set; }
}

