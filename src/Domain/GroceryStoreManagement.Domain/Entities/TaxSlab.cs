using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

public class TaxSlab : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public decimal CGSTRate { get; private set; } // Central GST
    public decimal SGSTRate { get; private set; } // State GST
    public decimal TotalGSTRate => CGSTRate + SGSTRate;
    public bool IsActive { get; private set; } = true;

    // Navigation properties
    public virtual ICollection<Product> Products { get; private set; } = new List<Product>();

    private TaxSlab() { } // EF Core

    public TaxSlab(string name, decimal cgstRate, decimal sgstRate)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Tax slab name cannot be null or empty", nameof(name));

        if (cgstRate < 0 || sgstRate < 0)
            throw new ArgumentException("Tax rates cannot be negative");

        Name = name;
        CGSTRate = cgstRate;
        SGSTRate = sgstRate;
    }

    public void Update(string name, decimal cgstRate, decimal sgstRate)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Tax slab name cannot be null or empty", nameof(name));

        if (cgstRate < 0 || sgstRate < 0)
            throw new ArgumentException("Tax rates cannot be negative");

        Name = name;
        CGSTRate = cgstRate;
        SGSTRate = sgstRate;
        UpdatedAt = DateTime.UtcNow;
    }
}

