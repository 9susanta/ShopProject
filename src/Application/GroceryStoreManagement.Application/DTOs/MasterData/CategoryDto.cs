namespace GroceryStoreManagement.Application.DTOs;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid TaxSlabId { get; set; }
    public TaxSlabDto? TaxSlab { get; set; } // Linked TaxSlab for Product form
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

