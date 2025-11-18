using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Reports;

public class GetSlowMovingProductsQuery : IRequest<SlowMovingProductsReportDto>
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int DaysThreshold { get; set; } = 90; // Products with low sales in last N days
    public int MinDaysSinceLastSale { get; set; } = 30; // Minimum days since last sale
}

