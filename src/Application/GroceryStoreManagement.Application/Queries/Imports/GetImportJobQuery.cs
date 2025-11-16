using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Imports;

public class GetImportJobQuery : IRequest<ImportJobDto?>
{
    public Guid ImportJobId { get; set; }
}

