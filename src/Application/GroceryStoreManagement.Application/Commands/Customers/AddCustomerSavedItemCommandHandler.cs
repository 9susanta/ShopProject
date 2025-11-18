using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Commands.Customers;

public class AddCustomerSavedItemCommandHandler : IRequestHandler<AddCustomerSavedItemCommand, CustomerSavedItemDto>
{
    private readonly IRepository<CustomerSavedItem> _savedItemRepository;
    private readonly IRepository<Customer> _customerRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddCustomerSavedItemCommandHandler(
        IRepository<CustomerSavedItem> savedItemRepository,
        IRepository<Customer> customerRepository,
        IRepository<Product> productRepository,
        IUnitOfWork unitOfWork)
    {
        _savedItemRepository = savedItemRepository;
        _customerRepository = customerRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CustomerSavedItemDto> Handle(AddCustomerSavedItemCommand request, CancellationToken cancellationToken)
    {
        // Verify customer exists
        var customer = await _customerRepository.GetByIdAsync(request.CustomerId, cancellationToken);
        if (customer == null)
            throw new InvalidOperationException($"Customer with ID {request.CustomerId} not found");

        // Verify product exists
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
            throw new InvalidOperationException($"Product with ID {request.ProductId} not found");

        // Check if already exists
        var existing = (await _savedItemRepository.GetAllAsync(cancellationToken))
            .FirstOrDefault(si => si.CustomerId == request.CustomerId && si.ProductId == request.ProductId);

        CustomerSavedItem savedItem;
        if (existing != null)
        {
            // Update existing
            existing.SetFavorite(request.IsFavorite);
            savedItem = existing;
        }
        else
        {
            // Create new
            savedItem = new CustomerSavedItem(request.CustomerId, request.ProductId);
            if (request.IsFavorite)
            {
                savedItem.SetFavorite(true);
            }
            await _savedItemRepository.AddAsync(savedItem, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CustomerSavedItemDto
        {
            Id = savedItem.Id,
            CustomerId = savedItem.CustomerId,
            ProductId = savedItem.ProductId,
            ProductName = product.Name,
            ProductSKU = product.SKU,
            ProductPrice = product.SalePrice,
            PurchaseCount = savedItem.PurchaseCount,
            LastPurchasedAt = savedItem.LastPurchasedAt,
            IsFavorite = savedItem.IsFavorite,
            CreatedAt = savedItem.CreatedAt
        };
    }
}

