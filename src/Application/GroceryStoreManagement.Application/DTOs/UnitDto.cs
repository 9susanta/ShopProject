using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.DTOs;

public class UnitDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public UnitType Type { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

