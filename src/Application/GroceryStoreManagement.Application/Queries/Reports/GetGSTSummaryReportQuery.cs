using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Reports;

public class GetGSTSummaryReportQuery : IRequest<GSTSummaryReportDto>
{
    public DateTime StartDate { get; set; } = DateTime.Today.AddDays(-30);
    public DateTime EndDate { get; set; } = DateTime.Today;
}

