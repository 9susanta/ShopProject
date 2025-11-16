using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Customers;

public class CreateCustomerCommandHandler : IRequestHandler<CreateCustomerCommand, CustomerDto>
{
    private readonly IRepository<Customer> _customerRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateCustomerCommandHandler> _logger;

    public CreateCustomerCommandHandler(
        IRepository<Customer> customerRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateCustomerCommandHandler> logger)
    {
        _customerRepository = customerRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<CustomerDto> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating customer: {CustomerName}", request.Name);

        // Check for duplicate phone
        var existingCustomers = await _customerRepository.GetAllAsync(cancellationToken);
        var cleanedPhone = request.Phone.Replace(" ", "").Replace("-", "").Replace("+", "");
        if (existingCustomers.Any(c => c.Phone == cleanedPhone))
            throw new InvalidOperationException($"Customer with phone '{request.Phone}' already exists");

        var customer = new Customer(request.Name, request.Phone, request.Email, request.Address, request.City, request.Pincode);
        await _customerRepository.AddAsync(customer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Customer created successfully: {CustomerId}", customer.Id);

        return new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            Address = customer.Address,
            City = customer.City,
            Pincode = customer.Pincode,
            IsActive = customer.IsActive,
            CreatedAt = customer.CreatedAt,
            UpdatedAt = customer.UpdatedAt
        };
    }
}

