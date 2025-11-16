using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class SupplierReturnItemConfiguration : IEntityTypeConfiguration<SupplierReturnItem>
{
    public void Configure(EntityTypeBuilder<SupplierReturnItem> builder)
    {
        builder.ToTable("SupplierReturnItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.SupplierReturnId)
            .IsRequired();

        builder.Property(i => i.ProductId)
            .IsRequired();

        builder.Property(i => i.Quantity)
            .IsRequired();

        builder.Property(i => i.UnitCost)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(i => i.Reason)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasOne(i => i.SupplierReturn)
            .WithMany(sr => sr.Items)
            .HasForeignKey(i => i.SupplierReturnId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Batch)
            .WithMany()
            .HasForeignKey(i => i.BatchId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

