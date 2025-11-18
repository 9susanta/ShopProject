using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class SupplierPaymentConfiguration : IEntityTypeConfiguration<SupplierPayment>
{
    public void Configure(EntityTypeBuilder<SupplierPayment> builder)
    {
        builder.ToTable("SupplierPayments");

        builder.HasKey(sp => sp.Id);

        builder.Property(sp => sp.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(sp => sp.PaymentDate)
            .IsRequired();

        builder.Property(sp => sp.ReferenceNumber)
            .HasMaxLength(100);

        builder.Property(sp => sp.Notes)
            .HasMaxLength(500);

        builder.HasOne(sp => sp.Supplier)
            .WithMany()
            .HasForeignKey(sp => sp.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(sp => sp.PurchaseOrder)
            .WithMany()
            .HasForeignKey(sp => sp.PurchaseOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(sp => sp.GoodsReceiveNote)
            .WithMany()
            .HasForeignKey(sp => sp.GRNId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(sp => sp.SupplierId);
        builder.HasIndex(sp => sp.PaymentDate);
    }
}

