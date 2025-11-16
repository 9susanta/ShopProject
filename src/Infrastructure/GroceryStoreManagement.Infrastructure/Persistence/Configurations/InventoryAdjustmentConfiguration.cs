using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class InventoryAdjustmentConfiguration : IEntityTypeConfiguration<InventoryAdjustment>
{
    public void Configure(EntityTypeBuilder<InventoryAdjustment> builder)
    {
        builder.ToTable("InventoryAdjustments");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.QuantityChange)
            .IsRequired();

        builder.Property(a => a.QuantityBefore)
            .IsRequired();

        builder.Property(a => a.QuantityAfter)
            .IsRequired();

        builder.Property(a => a.AdjustmentType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.Reason)
            .HasMaxLength(500);

        builder.Property(a => a.ReferenceNumber)
            .HasMaxLength(100);

        builder.Property(a => a.AdjustedBy)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasOne<Inventory>()
            .WithMany()
            .HasForeignKey(a => a.InventoryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Product>()
            .WithMany()
            .HasForeignKey(a => a.ProductId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(a => a.ProductId);
        builder.HasIndex(a => a.InventoryId);
        builder.HasIndex(a => a.CreatedAt);
    }
}

