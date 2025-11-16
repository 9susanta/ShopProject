using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Domain.Entities;

public class Unit : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Symbol { get; private set; } = string.Empty;
    public UnitType Type { get; private set; }
    public decimal ConversionFactor { get; private set; } = 1; // For conversion to base unit
    public bool IsActive { get; private set; } = true;

    // Navigation properties
    public virtual ICollection<Product> Products { get; private set; } = new List<Product>();

    private Unit() { } // EF Core

    public Unit(string name, string symbol, UnitType type, decimal conversionFactor = 1)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Unit name cannot be null or empty", nameof(name));

        Name = name;
        Symbol = symbol;
        Type = type;
        ConversionFactor = conversionFactor;
    }

    public void Update(string name, string symbol, decimal conversionFactor)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Unit name cannot be null or empty", nameof(name));

        Name = name;
        Symbol = symbol;
        ConversionFactor = conversionFactor;
        UpdatedAt = DateTime.UtcNow;
    }
}

