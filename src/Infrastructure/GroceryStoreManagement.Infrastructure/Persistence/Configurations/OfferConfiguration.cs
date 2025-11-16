using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class OfferConfiguration : IEntityTypeConfiguration<Offer>
{
    public void Configure(EntityTypeBuilder<Offer> builder)
    {
        builder.ToTable("Offers");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(o => o.Description)
            .HasMaxLength(500);

        builder.Property(o => o.Type)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(o => o.DiscountValue)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(o => o.CouponCode)
            .HasMaxLength(50);

        builder.HasOne(o => o.Product)
            .WithMany()
            .HasForeignKey(o => o.ProductId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(o => o.Category)
            .WithMany()
            .HasForeignKey(o => o.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(o => o.CouponCode)
            .IsUnique()
            .HasFilter("[CouponCode] IS NOT NULL");
    }
}

