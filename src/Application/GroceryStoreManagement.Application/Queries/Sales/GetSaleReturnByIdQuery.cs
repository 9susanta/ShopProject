using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Sales;

public class GetSaleReturnByIdQuery : IRequest<SaleReturnDto?>
{
    public Guid Id { get; set; }
}


