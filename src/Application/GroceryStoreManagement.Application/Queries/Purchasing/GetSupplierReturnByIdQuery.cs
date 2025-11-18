using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Purchasing;

public class GetSupplierReturnByIdQuery : IRequest<SupplierReturnDto?>
{
    public Guid Id { get; set; }
}



