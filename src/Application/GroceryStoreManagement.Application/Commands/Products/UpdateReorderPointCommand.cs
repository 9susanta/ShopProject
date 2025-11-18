using MediatR;

namespace GroceryStoreManagement.Application.Commands.Products;

public class UpdateReorderPointCommand : IRequest<bool>
{
    public Guid ProductId { get; set; }
    public int ReorderPoint { get; set; }
    public int SuggestedReorderQuantity { get; set; }
}

