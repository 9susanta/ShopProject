using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class SaleReturnItemConfiguration : IEntityTypeConfiguration<SaleReturnItem>
{
    public void Configure(EntityTypeBuilder<SaleReturnItem> builder)
    {
        builder.ToTable("SaleReturnItems");

        builder.HasKey(sri => sri.Id);

        builder.Property(sri => sri.SaleReturnId)
            .IsRequired();

        builder.Property(sri => sri.SaleItemId)
            .IsRequired();

        builder.Property(sri => sri.Quantity)
            .IsRequired();

        builder.Property(sri => sri.UnitPrice)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(sri => sri.TotalRefundAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(sri => sri.Reason)
            .IsRequired()
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(sri => sri.SaleReturn)
            .WithMany(sr => sr.Items)
            .HasForeignKey(sri => sri.SaleReturnId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(sri => sri.SaleItem)
            .WithMany()
            .HasForeignKey(sri => sri.SaleItemId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(sri => sri.SaleReturnId);

        builder.HasIndex(sri => sri.SaleItemId);
    }
}


