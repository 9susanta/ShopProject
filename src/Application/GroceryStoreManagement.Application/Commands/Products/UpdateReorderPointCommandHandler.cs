using MediatR;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Products;

public class UpdateReorderPointCommandHandler : IRequestHandler<UpdateReorderPointCommand, bool>
{
    private readonly IRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateReorderPointCommandHandler> _logger;

    public UpdateReorderPointCommandHandler(
        IRepository<Product> productRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateReorderPointCommandHandler> logger)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<bool> Handle(UpdateReorderPointCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
            throw new KeyNotFoundException($"Product with ID {request.ProductId} not found.");

        product.UpdateReorderPoint(request.ReorderPoint, request.SuggestedReorderQuantity);
        await _productRepository.UpdateAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Reorder point updated for product {ProductId}: ReorderPoint={ReorderPoint}, SuggestedQuantity={SuggestedQuantity}",
            request.ProductId, request.ReorderPoint, request.SuggestedReorderQuantity);

        return true;
    }
}

