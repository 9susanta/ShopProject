using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

public class TaxSlab : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public decimal Rate { get; private set; } // Single tax rate (e.g., 5, 12, 18)
    public bool IsDefault { get; private set; } = false;
    public bool IsActive { get; private set; } = true;

    // Navigation properties
    public virtual ICollection<Product> Products { get; private set; } = new List<Product>();
    public virtual ICollection<Category> Categories { get; private set; } = new List<Category>();

    private TaxSlab() { } // EF Core

    public TaxSlab(string name, decimal rate, bool isDefault = false)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Tax slab name cannot be null or empty", nameof(name));

        if (rate < 0 || rate > 28)
            throw new ArgumentException("Tax rate must be between 0 and 28", nameof(rate));

        Name = name;
        Rate = rate;
        IsDefault = isDefault;
    }

    public void Update(string name, decimal rate)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Tax slab name cannot be null or empty", nameof(name));

        if (rate < 0 || rate > 28)
            throw new ArgumentException("Tax rate must be between 0 and 28", nameof(rate));

        Name = name;
        Rate = rate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAsDefault()
    {
        IsDefault = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveDefault()
    {
        IsDefault = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        if (IsDefault)
            IsDefault = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }
}

