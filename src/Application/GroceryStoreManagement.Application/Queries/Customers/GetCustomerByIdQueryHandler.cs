using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Queries.Customers;

public class GetCustomerByIdQueryHandler : IRequestHandler<GetCustomerByIdQuery, CustomerDto?>
{
    private readonly IRepository<Customer> _customerRepository;

    public GetCustomerByIdQueryHandler(IRepository<Customer> customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<CustomerDto?> Handle(GetCustomerByIdQuery request, CancellationToken cancellationToken)
    {
        var customer = await _customerRepository.GetByIdAsync(request.Id, cancellationToken);
        if (customer == null)
            return null;

        // Calculate total orders and total spent
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

