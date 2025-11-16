using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class InventoryAuditConfiguration : IEntityTypeConfiguration<InventoryAudit>
{
    public void Configure(EntityTypeBuilder<InventoryAudit> builder)
    {
        builder.ToTable("InventoryAudits");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.ProductId)
            .IsRequired();

        builder.Property(a => a.AdjustmentType)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(a => a.QuantityChange)
            .IsRequired();

        builder.Property(a => a.QuantityBefore)
            .IsRequired();

        builder.Property(a => a.QuantityAfter)
            .IsRequired();

        builder.Property(a => a.Reason)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.ReferenceNumber)
            .HasMaxLength(100);

        builder.Property(a => a.PerformedBy)
            .HasMaxLength(100);

        builder.HasOne(a => a.Product)
            .WithMany()
            .HasForeignKey(a => a.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Batch)
            .WithMany()
            .HasForeignKey(a => a.BatchId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(a => a.ProductId);
        builder.HasIndex(a => a.ReferenceId);
        builder.HasIndex(a => a.CreatedAt);
    }
}

