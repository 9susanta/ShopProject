using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Purchases;

public class GetGRNByIdQuery : IRequest<GRNDto?>
{
    public Guid Id { get; set; }
}

