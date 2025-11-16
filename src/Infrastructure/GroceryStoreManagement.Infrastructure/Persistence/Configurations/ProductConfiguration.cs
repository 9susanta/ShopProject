using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.SKU)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.MRP)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(p => p.SalePrice)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(p => p.Barcode)
            .HasMaxLength(50);

        builder.Property(p => p.ImageUrl)
            .HasMaxLength(500);

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Unit)
            .WithMany(u => u.Products)
            .HasForeignKey(p => p.UnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.TaxSlab)
            .WithMany(ts => ts.Products)
            .HasForeignKey(p => p.TaxSlabId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasIndex(p => p.SKU)
            .IsUnique();

        // Unique constraint on Barcode if provided
        builder.HasIndex(p => p.Barcode)
            .IsUnique()
            .HasFilter("[Barcode] IS NOT NULL");
    }
}

