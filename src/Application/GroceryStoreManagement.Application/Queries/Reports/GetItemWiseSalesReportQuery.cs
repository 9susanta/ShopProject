using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Reports;

public class GetItemWiseSalesReportQuery : IRequest<ItemWiseSalesReportDto>
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public Guid? ProductId { get; set; }
    public Guid? CategoryId { get; set; }
}

