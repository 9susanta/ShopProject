using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class SupplierReturnConfiguration : IEntityTypeConfiguration<SupplierReturn>
{
    public void Configure(EntityTypeBuilder<SupplierReturn> builder)
    {
        builder.ToTable("SupplierReturns");

        builder.HasKey(sr => sr.Id);

        builder.Property(sr => sr.ReturnNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(sr => sr.SupplierId)
            .IsRequired();

        builder.Property(sr => sr.TotalAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(sr => sr.Reason)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(sr => sr.Notes)
            .HasMaxLength(1000);

        builder.HasOne(sr => sr.Supplier)
            .WithMany()
            .HasForeignKey(sr => sr.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(sr => sr.GoodsReceiveNote)
            .WithMany()
            .HasForeignKey(sr => sr.GRNId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(sr => sr.Items)
            .WithOne(i => i.SupplierReturn)
            .HasForeignKey(i => i.SupplierReturnId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(sr => sr.ReturnNumber)
            .IsUnique();

        builder.HasIndex(sr => sr.SupplierId);
        builder.HasIndex(sr => sr.GRNId);
    }
}

