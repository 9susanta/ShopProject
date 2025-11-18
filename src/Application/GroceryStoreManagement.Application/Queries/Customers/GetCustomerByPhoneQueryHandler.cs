using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Customers;

public class GetCustomerByPhoneQueryHandler : IRequestHandler<GetCustomerByPhoneQuery, CustomerDto?>
{
    private readonly IRepository<Customer> _customerRepository;
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetCustomerByPhoneQueryHandler> _logger;

    public GetCustomerByPhoneQueryHandler(
        IRepository<Customer> customerRepository,
        ICacheService cacheService,
        ILogger<GetCustomerByPhoneQueryHandler> logger)
    {
        _customerRepository = customerRepository;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<CustomerDto?> Handle(GetCustomerByPhoneQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"customer:phone:{request.Phone}";
        
        var cached = await _cacheService.GetAsync<CustomerDto>(cacheKey, cancellationToken);
        if (cached != null)
        {
            _logger.LogDebug("Cache hit for customer by phone: {Phone}", request.Phone);
            return cached;
        }

        _logger.LogDebug("Cache miss for customer by phone: {Phone}", request.Phone);

        var customers = await _customerRepository.FindAsync(c => c.Phone == request.Phone, cancellationToken);
        var customer = customers.FirstOrDefault();

        if (customer == null)
            return null;

        // Calculate total orders and total spent
        var totalOrders = customer.Sales?.Count(s => s.Status == Domain.Enums.SaleStatus.Completed) ?? 0;
        var totalSpent = customer.Sales?
            .Where(s => s.Status == Domain.Enums.SaleStatus.Completed)
            .Sum(s => s.TotalAmount) ?? 0;

        var result = new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Email = customer.Email,
            Phone = customer.Phone,
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

        // Cache for 15 minutes
        await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(15), cancellationToken);

        return result;
    }
}

