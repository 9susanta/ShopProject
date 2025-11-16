using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid TaxSlabId { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Navigation properties
    public virtual TaxSlab TaxSlab { get; private set; } = null!;
    public virtual ICollection<Product> Products { get; private set; } = new List<Product>();

    private Category() { } // EF Core

    public Category(string name, Guid taxSlabId, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name cannot be null or empty", nameof(name));

        if (taxSlabId == Guid.Empty)
            throw new ArgumentException("TaxSlabId is required", nameof(taxSlabId));

        Name = name;
        TaxSlabId = taxSlabId;
        Description = description;
    }

    public void Update(string name, Guid taxSlabId, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name cannot be null or empty", nameof(name));

        if (taxSlabId == Guid.Empty)
            throw new ArgumentException("TaxSlabId is required", nameof(taxSlabId));

        Name = name;
        TaxSlabId = taxSlabId;
        Description = description;
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

