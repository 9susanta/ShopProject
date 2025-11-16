using FluentValidation;

namespace GroceryStoreManagement.Application.Validation;

public class ImportRowValidator : AbstractValidator<Dictionary<string, object>>
{
    public ImportRowValidator()
    {
        RuleFor(x => x)
            .Must(HaveRequiredFields).WithMessage("Row must contain Name, and either Barcode or SKU");

        When(x => x.ContainsKey("Price") || x.ContainsKey("SalePrice") || x.ContainsKey("MRP"), () =>
        {
            RuleFor(x => GetDecimalValue(x, "Price") ?? GetDecimalValue(x, "SalePrice") ?? GetDecimalValue(x, "MRP"))
                .GreaterThan(0).WithMessage("Price must be greater than 0");
        });

        When(x => x.ContainsKey("GST") || x.ContainsKey("GSTRate"), () =>
        {
            RuleFor(x => GetDecimalValue(x, "GST") ?? GetDecimalValue(x, "GSTRate"))
                .Must(gst => gst == 0 || gst == 5 || gst == 12 || gst == 18)
                .WithMessage("GST must be 0, 5, 12, or 18");
        });

        When(x => x.ContainsKey("Quantity"), () =>
        {
            RuleFor(x => GetIntValue(x, "Quantity"))
                .GreaterThanOrEqualTo(0).WithMessage("Quantity must be greater than or equal to 0");
        });
    }

    private bool HaveRequiredFields(Dictionary<string, object> row)
    {
        var hasName = row.ContainsKey("Name") && !string.IsNullOrWhiteSpace(row["Name"]?.ToString());
        var hasBarcode = row.ContainsKey("Barcode") && !string.IsNullOrWhiteSpace(row["Barcode"]?.ToString());
        var hasSKU = row.ContainsKey("SKU") && !string.IsNullOrWhiteSpace(row["SKU"]?.ToString());

        return hasName && (hasBarcode || hasSKU);
    }

    private decimal? GetDecimalValue(Dictionary<string, object> row, string key)
    {
        if (!row.ContainsKey(key))
            return null;

        var value = row[key];
        if (value == null)
            return null;

        if (decimal.TryParse(value.ToString(), out var result))
            return result;

        return null;
    }

    private int? GetIntValue(Dictionary<string, object> row, string key)
    {
        if (!row.ContainsKey(key))
            return null;

        var value = row[key];
        if (value == null)
            return null;

        if (int.TryParse(value.ToString(), out var result))
            return result;

        return null;
    }
}

