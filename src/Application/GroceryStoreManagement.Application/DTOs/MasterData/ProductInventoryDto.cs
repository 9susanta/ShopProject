namespace GroceryStoreManagement.Application.DTOs;

public class ProductInventoryDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSKU { get; set; } = string.Empty;
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public int TotalQuantity { get; set; }
    public int AvailableQuantity { get; set; }
    public int ReservedQuantity { get; set; }
    public int? LowStockThreshold { get; set; }
    public bool IsLowStock { get; set; }
    public List<InventoryBatchDto> Batches { get; set; } = new();
    public DateTime LastUpdatedAt { get; set; }
}

public class InventoryBatchDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? ProductSKU { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int AvailableQuantity { get; set; }
    public int ReservedQuantity { get; set; }
    public decimal UnitCost { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public DateTime ReceivedDate { get; set; }
    public bool IsExpiringSoon { get; set; }
    public int? DaysUntilExpiry { get; set; }
    public string? Location { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ProductInventoryListResponseDto
{
    public List<ProductInventoryDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling(TotalCount / (double)PageSize) : 0;
}

