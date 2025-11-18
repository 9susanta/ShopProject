using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Queries.Customers;

public class GetCustomersQueryHandler : IRequestHandler<GetCustomersQuery, CustomerListResponseDto>
{
    private readonly IRepository<Customer> _customerRepository;

    public GetCustomersQueryHandler(IRepository<Customer> customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<CustomerListResponseDto> Handle(GetCustomersQuery request, CancellationToken cancellationToken)
    {
        var allCustomers = await _customerRepository.GetAllAsync(cancellationToken);
        var customers = allCustomers.AsQueryable();

        // Filter by search term
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.ToLower();
            customers = customers.Where(c =>
                c.Name.ToLower().Contains(searchTerm) ||
                c.Phone.Contains(searchTerm) ||
                (c.Email != null && c.Email.ToLower().Contains(searchTerm)));
        }

        // Filter by active status
        if (request.IsActive.HasValue)
        {
            customers = customers.Where(c => c.IsActive == request.IsActive.Value);
        }

        // Get total count before pagination
        var totalCount = customers.Count();

        // Apply pagination
        var pagedCustomers = customers
            .OrderBy(c => c.Name)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var customerDtos = pagedCustomers.Select(c =>
        {
            var totalOrders = c.Sales?.Count(s => s.Status == Domain.Enums.SaleStatus.Completed) ?? 0;
            var totalSpent = c.Sales?
                .Where(s => s.Status == Domain.Enums.SaleStatus.Completed)
                .Sum(s => s.TotalAmount) ?? 0;

            return new CustomerDto
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                Address = c.Address,
                City = c.City,
                Pincode = c.Pincode,
                LoyaltyPoints = c.LoyaltyPoints,
                PayLaterBalance = c.PayLaterBalance,
                PayLaterLimit = c.PayLaterLimit,
                IsPayLaterEnabled = c.IsPayLaterEnabled,
                PreferredPaymentMethod = c.PreferredPaymentMethod,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                TotalOrders = totalOrders,
                TotalSpent = totalSpent
            };
        }).ToList();

        return new CustomerListResponseDto
        {
            Items = customerDtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}

