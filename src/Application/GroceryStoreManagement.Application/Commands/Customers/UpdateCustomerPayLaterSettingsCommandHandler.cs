using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Commands.Customers;

public class UpdateCustomerPayLaterSettingsCommandHandler : IRequestHandler<UpdateCustomerPayLaterSettingsCommand, CustomerDto>
{
    private readonly IRepository<Customer> _customerRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCustomerPayLaterSettingsCommandHandler(
        IRepository<Customer> customerRepository,
        IUnitOfWork unitOfWork)
    {
        _customerRepository = customerRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CustomerDto> Handle(UpdateCustomerPayLaterSettingsCommand request, CancellationToken cancellationToken)
    {
        var customer = await _customerRepository.GetByIdAsync(request.CustomerId, cancellationToken);
        if (customer == null)
            throw new InvalidOperationException($"Customer with ID {request.CustomerId} not found");

        if (request.IsPayLaterEnabled)
        {
            var limit = request.PayLaterLimit ?? 2000; // Default ₹2000
            customer.EnablePayLater(limit);
        }
        else
        {
            customer.DisablePayLater();
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Calculate totals
        var totalOrders = customer.Sales?.Count(s => s.Status == Domain.Enums.SaleStatus.Completed) ?? 0;
        var totalSpent = customer.Sales?
            .Where(s => s.Status == Domain.Enums.SaleStatus.Completed)
            .Sum(s => s.TotalAmount) ?? 0;

        return new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            Address = customer.Address,
            City = customer.City,
            Pincode = customer.Pincode,
            LoyaltyPoints = customer.LoyaltyPoints,
            PayLaterBalance = customer.PayLaterBalance,
            PayLaterLimit = customer.PayLaterLimit,
            IsPayLaterEnabled = customer.IsPayLaterEnabled,
            PreferredPaymentMethod = customer.PreferredPaymentMethod,
            IsActive = customer.IsActive,
            CreatedAt = customer.CreatedAt,
            UpdatedAt = customer.UpdatedAt,
            TotalOrders = totalOrders,
            TotalSpent = totalSpent
        };
    }
}

