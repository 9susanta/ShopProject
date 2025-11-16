using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Commands.Products;

public class CreateProductCommand : IRequest<ProductDto>
{
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public decimal MRP { get; set; }
    public decimal SalePrice { get; set; }
    public Guid CategoryId { get; set; }
    public Guid UnitId { get; set; }
    public Guid? TaxSlabId { get; set; } // Optional - will be auto-filled from Category if not provided
    public string? Description { get; set; }
    public string? Barcode { get; set; }
    public string? ImageUrl { get; set; }
    public int LowStockThreshold { get; set; } = 10;
    public bool IsWeightBased { get; set; } = false;
    public decimal? WeightPerUnit { get; set; }
}

