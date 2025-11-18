using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class SaleReturnConfiguration : IEntityTypeConfiguration<SaleReturn>
{
    public void Configure(EntityTypeBuilder<SaleReturn> builder)
    {
        builder.ToTable("SaleReturns");

        builder.HasKey(sr => sr.Id);

        builder.Property(sr => sr.ReturnNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(sr => sr.SaleId)
            .IsRequired();

        builder.Property(sr => sr.ReturnDate)
            .IsRequired();

        builder.Property(sr => sr.Reason)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(sr => sr.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(sr => sr.TotalRefundAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(sr => sr.Notes)
            .HasMaxLength(1000);

        // Relationships
        builder.HasOne(sr => sr.Sale)
            .WithMany()
            .HasForeignKey(sr => sr.SaleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(sr => sr.Refund)
            .WithOne(r => r.SaleReturn)
            .HasForeignKey<Refund>(r => r.SaleReturnId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(sr => sr.Items)
            .WithOne(i => i.SaleReturn)
            .HasForeignKey(i => i.SaleReturnId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(sr => sr.ReturnNumber)
            .IsUnique();

        builder.HasIndex(sr => sr.SaleId);

        builder.HasIndex(sr => sr.ReturnDate);

        builder.HasIndex(sr => sr.Status);
    }
}


