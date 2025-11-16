using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Domain.Entities;

public class Unit : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Symbol { get; private set; } = string.Empty;
    public UnitType Type { get; private set; }
    public int SortOrder { get; private set; } = 0;
    public bool IsActive { get; private set; } = true;

    // Navigation properties
    public virtual ICollection<Product> Products { get; private set; } = new List<Product>();

    private Unit() { } // EF Core

    public Unit(string name, string symbol, UnitType type, int sortOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Unit name cannot be null or empty", nameof(name));

        if (string.IsNullOrWhiteSpace(symbol))
            throw new ArgumentException("Unit symbol cannot be null or empty", nameof(symbol));

        Name = name;
        Symbol = symbol;
        Type = type;
        SortOrder = sortOrder;
    }

    public void Update(string name, string symbol, int sortOrder)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Unit name cannot be null or empty", nameof(name));

        if (string.IsNullOrWhiteSpace(symbol))
            throw new ArgumentException("Unit symbol cannot be null or empty", nameof(symbol));

        Name = name;
        Symbol = symbol;
        SortOrder = sortOrder;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }
}

