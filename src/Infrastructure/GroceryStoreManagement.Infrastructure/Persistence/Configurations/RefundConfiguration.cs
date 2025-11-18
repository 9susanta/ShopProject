using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class RefundConfiguration : IEntityTypeConfiguration<Refund>
{
    public void Configure(EntityTypeBuilder<Refund> builder)
    {
        builder.ToTable("Refunds");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.SaleReturnId)
            .IsRequired();

        builder.Property(r => r.Amount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(r => r.PaymentMethod)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(r => r.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(r => r.TransactionId)
            .HasMaxLength(100);

        builder.Property(r => r.ReferenceNumber)
            .HasMaxLength(100);

        builder.Property(r => r.Notes)
            .HasMaxLength(1000);

        // Relationships
        builder.HasOne(r => r.SaleReturn)
            .WithOne(sr => sr.Refund)
            .HasForeignKey<Refund>(r => r.SaleReturnId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(r => r.SaleReturnId)
            .IsUnique();

        builder.HasIndex(r => r.Status);

        builder.HasIndex(r => r.ProcessedAt);
    }
}


