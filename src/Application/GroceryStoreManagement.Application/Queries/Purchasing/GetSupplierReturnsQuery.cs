using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Purchasing;

public class GetSupplierReturnsQuery : IRequest<List<SupplierReturnDto>>
{
    public Guid? SupplierId { get; set; }
    public Guid? GRNId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}



