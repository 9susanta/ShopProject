using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Queries.Sales;

public class GetSaleReturnsQuery : IRequest<List<SaleReturnDto>>
{
    public Guid? SaleId { get; set; }
    public ReturnStatus? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}


