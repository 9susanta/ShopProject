using FluentValidation;
using GroceryStoreManagement.Application.Commands.Customers;
using System.Text.RegularExpressions;

namespace GroceryStoreManagement.Application.Validation;

public class CreateCustomerCommandValidator : AbstractValidator<CreateCustomerCommand>
{
    public CreateCustomerCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Customer name is required")
            .MaximumLength(200).WithMessage("Customer name must not exceed 200 characters");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required")
            .Must(BeValidIndianPhoneNumber).WithMessage("Phone number must be 10 digits");

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email))
            .WithMessage("Email must be a valid email address")
            .MaximumLength(100).WithMessage("Email must not exceed 100 characters");

        RuleFor(x => x.Address)
            .MaximumLength(500).WithMessage("Address must not exceed 500 characters");

        RuleFor(x => x.City)
            .MaximumLength(100).WithMessage("City must not exceed 100 characters");

        RuleFor(x => x.Pincode)
            .MaximumLength(10).WithMessage("Pincode must not exceed 10 characters");
    }

    private bool BeValidIndianPhoneNumber(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return false;

        var cleanedPhone = phone.Replace(" ", "").Replace("-", "").Replace("+", "");
        return cleanedPhone.Length == 10 && cleanedPhone.All(char.IsDigit);
    }
}

