using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class GoodsReceiveNoteConfiguration : IEntityTypeConfiguration<GoodsReceiveNote>
{
    public void Configure(EntityTypeBuilder<GoodsReceiveNote> builder)
    {
        builder.ToTable("GoodsReceiveNotes");

        builder.HasKey(grn => grn.Id);

        builder.Property(grn => grn.GRNNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(grn => grn.SupplierId)
            .IsRequired();

        builder.Property(grn => grn.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(grn => grn.TotalAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(grn => grn.InvoiceNumber)
            .HasMaxLength(100);

        builder.Property(grn => grn.InvoiceFilePath)
            .HasMaxLength(500);

        builder.Property(grn => grn.Notes)
            .HasMaxLength(1000);

        builder.Property(grn => grn.IdempotencyKey)
            .HasMaxLength(100);

        builder.HasOne(grn => grn.Supplier)
            .WithMany()
            .HasForeignKey(grn => grn.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(grn => grn.PurchaseOrder)
            .WithMany()
            .HasForeignKey(grn => grn.PurchaseOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(grn => grn.Items)
            .WithOne(i => i.GoodsReceiveNote)
            .HasForeignKey(i => i.GRNId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(grn => grn.GRNNumber)
            .IsUnique();

        builder.HasIndex(grn => grn.SupplierId);
        builder.HasIndex(grn => grn.PurchaseOrderId);
        builder.HasIndex(grn => grn.IdempotencyKey);
    }
}

