using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Commands.Customers;

public class UpdateCustomerCommandHandler : IRequestHandler<UpdateCustomerCommand, CustomerDto>
{
    private readonly IRepository<Customer> _customerRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateCustomerCommandHandler> _logger;

    public UpdateCustomerCommandHandler(
        IRepository<Customer> customerRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateCustomerCommandHandler> logger)
    {
        _customerRepository = customerRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<CustomerDto> Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating customer: {CustomerId}", request.Id);

        var customer = await _customerRepository.GetByIdAsync(request.Id, cancellationToken);
        if (customer == null)
            throw new InvalidOperationException($"Customer with id {request.Id} not found");

        customer.Update(request.Name, request.Email, request.Address, request.City, request.Pincode);
        await _customerRepository.UpdateAsync(customer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Customer updated successfully: {CustomerId}", customer.Id);

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

