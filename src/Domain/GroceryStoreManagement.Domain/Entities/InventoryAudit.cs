using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Domain.Entities;

/// <summary>
/// Audit log for inventory changes (who changed what and why)
/// </summary>
public class InventoryAudit : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Guid? BatchId { get; private set; } // Optional - link to specific batch
    public InventoryAdjustmentType AdjustmentType { get; private set; }
    public int QuantityChange { get; private set; } // Positive for increase, negative for decrease
    public int QuantityBefore { get; private set; }
    public int QuantityAfter { get; private set; }
    public string Reason { get; private set; } = string.Empty;
    public string? ReferenceNumber { get; private set; } // PO, GRN, Sale, etc.
    public Guid? ReferenceId { get; private set; } // ID of the reference entity
    public string? PerformedBy { get; private set; } // User who made the change

    // Navigation properties
    public virtual Product Product { get; private set; } = null!;
    public virtual InventoryBatch? Batch { get; private set; }

    private InventoryAudit() { } // EF Core

    public InventoryAudit(
        Guid productId,
        InventoryAdjustmentType adjustmentType,
        int quantityChange,
        int quantityBefore,
        int quantityAfter,
        string reason,
        Guid? batchId = null,
        string? referenceNumber = null,
        Guid? referenceId = null,
        string? performedBy = null)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Reason cannot be null or empty", nameof(reason));

        ProductId = productId;
        BatchId = batchId;
        AdjustmentType = adjustmentType;
        QuantityChange = quantityChange;
        QuantityBefore = quantityBefore;
        QuantityAfter = quantityAfter;
        Reason = reason;
        ReferenceNumber = referenceNumber;
        ReferenceId = referenceId;
        PerformedBy = performedBy;
    }
}

