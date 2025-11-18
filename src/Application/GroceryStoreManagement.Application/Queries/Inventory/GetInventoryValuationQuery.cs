using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetInventoryValuationQuery : IRequest<InventoryValuationDto>
{
    public string Method { get; set; } = "FIFO"; // FIFO or LIFO
    public Guid? ProductId { get; set; } // Optional: calculate for specific product
}

