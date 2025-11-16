using FluentValidation;
using GroceryStoreManagement.Application.Commands.Products;

namespace GroceryStoreManagement.Application.Validation;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters");

        RuleFor(x => x.SKU)
            .NotEmpty().WithMessage("SKU is required")
            .MaximumLength(50).WithMessage("SKU must not exceed 50 characters");

        RuleFor(x => x.MRP)
            .GreaterThanOrEqualTo(0).WithMessage("MRP must be greater than or equal to 0");

        RuleFor(x => x.SalePrice)
            .GreaterThanOrEqualTo(0).WithMessage("Sale price must be greater than or equal to 0")
            .LessThanOrEqualTo(x => x.MRP).WithMessage("Sale price cannot be greater than MRP");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Category ID is required");

        RuleFor(x => x.UnitId)
            .NotEmpty().WithMessage("Unit ID is required");

        RuleFor(x => x.TaxSlabId)
            .NotEmpty().When(x => x.TaxSlabId.HasValue).WithMessage("Tax Slab ID must be valid if provided");

        RuleFor(x => x.LowStockThreshold)
            .GreaterThanOrEqualTo(0).WithMessage("Low stock threshold must be greater than or equal to 0");
    }
}

