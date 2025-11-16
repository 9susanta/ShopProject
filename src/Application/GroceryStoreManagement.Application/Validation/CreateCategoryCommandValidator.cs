using FluentValidation;
using GroceryStoreManagement.Application.Commands.Categories;

namespace GroceryStoreManagement.Application.Validation;

public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Category name is required")
            .MaximumLength(100).WithMessage("Category name must not exceed 100 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

        RuleFor(x => x.TaxSlabId)
            .NotEmpty().WithMessage("Tax Slab ID is required");
    }
}

