using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Reports;

public class GetDailySalesReportQuery : IRequest<DailySalesReportDto>
{
    public DateTime Date { get; set; } = DateTime.Today;
}

