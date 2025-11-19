namespace GroceryStoreManagement.Application.DTOs;

public class TaxSlabDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

