using FluentValidation;
using GroceryStoreManagement.Application.Commands.TaxSlabs;

namespace GroceryStoreManagement.Application.Validation;

public class UpdateTaxSlabCommandValidator : AbstractValidator<UpdateTaxSlabCommand>
{
    public UpdateTaxSlabCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Tax Slab ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tax slab name is required")
            .MaximumLength(100).WithMessage("Tax slab name must not exceed 100 characters");

        RuleFor(x => x.Rate)
            .GreaterThanOrEqualTo(0).WithMessage("Tax rate must be greater than or equal to 0")
            .LessThanOrEqualTo(28).WithMessage("Tax rate must be less than or equal to 28");
    }
}

