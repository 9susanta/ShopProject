using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Sales;

public class GetSaleByIdQuery : IRequest<SaleDto?>
{
    public Guid Id { get; set; }
}

