using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Accounting;

public class GetDailyClosingSummaryQuery : IRequest<DailyClosingSummaryDto>
{
    public DateTime Date { get; set; } = DateTime.Today;
}

