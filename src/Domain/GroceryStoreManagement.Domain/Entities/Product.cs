using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;
using GroceryStoreManagement.Domain.ValueObjects;

namespace GroceryStoreManagement.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string SKU { get; private set; } = string.Empty;
    public string? Barcode { get; private set; }
    public string? ImageUrl { get; private set; }
    public decimal MRP { get; private set; } // Maximum Retail Price
    public decimal SalePrice { get; private set; } // Selling Price
    public Guid CategoryId { get; private set; }
    public Guid UnitId { get; private set; }
    public Guid? TaxSlabId { get; private set; } // Nullable - can be auto-filled from Category
    public int LowStockThreshold { get; private set; } = 10;
    public int ReorderPoint { get; private set; } = 0; // Minimum stock level before reordering
    public int SuggestedReorderQuantity { get; private set; } = 0; // Suggested quantity to reorder
    public bool IsWeightBased { get; private set; } = false;
    public decimal? WeightPerUnit { get; private set; } // For weight-based products
    public ProductStatus Status { get; private set; } = ProductStatus.Active;
    public bool IsActive { get; private set; } = true;

    // Navigation properties
    public virtual Category Category { get; private set; } = null!;
    public virtual Unit Unit { get; private set; } = null!;
    public virtual TaxSlab? TaxSlab { get; private set; }
    public virtual ICollection<PurchaseOrderItem> PurchaseOrderItems { get; private set; } = new List<PurchaseOrderItem>();
    public virtual ICollection<SaleItem> SaleItems { get; private set; } = new List<SaleItem>();
    public virtual Inventory? Inventory { get; private set; }

    private Product() { } // EF Core

    public Product(string name, string sku, decimal mrp, decimal salePrice, Guid categoryId, Guid unitId, 
        string? description = null, string? barcode = null, string? imageUrl = null, int lowStockThreshold = 10, 
        bool isWeightBased = false, decimal? weightPerUnit = null, Guid? taxSlabId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Product name cannot be null or empty", nameof(name));
        
        if (string.IsNullOrWhiteSpace(sku))
            throw new ArgumentException("SKU cannot be null or empty", nameof(sku));

        if (mrp < 0 || salePrice < 0)
            throw new ArgumentException("Prices cannot be negative");

        if (salePrice > mrp)
            throw new ArgumentException("Sale price cannot be greater than MRP");

        if (lowStockThreshold < 0)
            throw new ArgumentException("Low stock threshold cannot be negative", nameof(lowStockThreshold));

        Name = name;
        SKU = sku;
        MRP = mrp;
        SalePrice = salePrice;
        CategoryId = categoryId;
        UnitId = unitId;
        TaxSlabId = taxSlabId; // Can be null, will be set from Category if needed
        Description = description;
        Barcode = barcode;
        ImageUrl = imageUrl;
        LowStockThreshold = lowStockThreshold;
        IsWeightBased = isWeightBased;
        WeightPerUnit = weightPerUnit;
    }

    public void SetTaxSlab(Guid taxSlabId)
    {
        if (taxSlabId == Guid.Empty)
            throw new ArgumentException("TaxSlabId cannot be empty", nameof(taxSlabId));
        
        TaxSlabId = taxSlabId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateReorderPoint(int reorderPoint, int suggestedReorderQuantity)
    {
        if (reorderPoint < 0)
            throw new ArgumentException("Reorder point cannot be negative", nameof(reorderPoint));
        if (suggestedReorderQuantity < 0)
            throw new ArgumentException("Suggested reorder quantity cannot be negative", nameof(suggestedReorderQuantity));

        ReorderPoint = reorderPoint;
        SuggestedReorderQuantity = suggestedReorderQuantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(string name, decimal mrp, decimal salePrice, string? description = null, 
        string? barcode = null, string? imageUrl = null, int? lowStockThreshold = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Product name cannot be null or empty", nameof(name));

        if (mrp < 0 || salePrice < 0)
            throw new ArgumentException("Prices cannot be negative");

        if (salePrice > mrp)
            throw new ArgumentException("Sale price cannot be greater than MRP");

        Name = name;
        MRP = mrp;
        SalePrice = salePrice;
        Description = description;
        Barcode = barcode;
        ImageUrl = imageUrl;
        
        if (lowStockThreshold.HasValue)
        {
            if (lowStockThreshold.Value < 0)
                throw new ArgumentException("Low stock threshold cannot be negative", nameof(lowStockThreshold));
            LowStockThreshold = lowStockThreshold.Value;
        }

        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePrice(decimal mrp, decimal salePrice)
    {
        if (mrp < 0 || salePrice < 0)
            throw new ArgumentException("Prices cannot be negative");

        if (salePrice > mrp)
            throw new ArgumentException("Sale price cannot be greater than MRP");

        MRP = mrp;
        SalePrice = salePrice;
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

