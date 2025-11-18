using GroceryStoreManagement.Domain.Common;

namespace GroceryStoreManagement.Domain.Entities;

public class Permission : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty; // e.g., "Sales", "Purchasing", "Inventory"

    private Permission() { } // For EF Core

    public Permission(string name, string description, string category)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Permission name cannot be null or empty", nameof(name));

        Name = name;
        Description = description;
        Category = category;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(string description, string category)
    {
        Description = description;
        Category = category;
        UpdatedAt = DateTime.UtcNow;
    }
}

