using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Reports;

public class GetExpiryReportQuery : IRequest<ExpiryReportDto>
{
    public int DaysThreshold { get; set; } = 30; // Products expiring within N days
}

