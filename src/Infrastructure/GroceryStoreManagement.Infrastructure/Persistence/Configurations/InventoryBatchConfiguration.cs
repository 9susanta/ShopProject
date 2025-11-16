using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class InventoryBatchConfiguration : IEntityTypeConfiguration<InventoryBatch>
{
    public void Configure(EntityTypeBuilder<InventoryBatch> builder)
    {
        builder.ToTable("InventoryBatches");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.ProductId)
            .IsRequired();

        builder.Property(b => b.Quantity)
            .IsRequired();

        builder.Property(b => b.AvailableQuantity)
            .IsRequired();

        builder.Property(b => b.UnitCost)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(b => b.BatchNumber)
            .HasMaxLength(100);

        builder.Property(b => b.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasOne(b => b.Product)
            .WithMany()
            .HasForeignKey(b => b.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.PurchaseOrder)
            .WithMany()
            .HasForeignKey(b => b.PurchaseOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(b => b.GoodsReceiveNote)
            .WithMany()
            .HasForeignKey(b => b.GRNId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(b => b.ProductId);
        builder.HasIndex(b => b.ExpiryDate);
        builder.HasIndex(b => new { b.ProductId, b.ExpiryDate });
    }
}

