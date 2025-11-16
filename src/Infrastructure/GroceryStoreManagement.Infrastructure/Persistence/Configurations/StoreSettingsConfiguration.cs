using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class StoreSettingsConfiguration : IEntityTypeConfiguration<StoreSettings>
{
    public void Configure(EntityTypeBuilder<StoreSettings> builder)
    {
        builder.ToTable("StoreSettings");

        builder.HasKey(ss => ss.Id);

        builder.Property(ss => ss.StoreName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ss => ss.GSTIN)
            .HasMaxLength(15);

        builder.Property(ss => ss.Address)
            .HasMaxLength(500);

        builder.Property(ss => ss.City)
            .HasMaxLength(100);

        builder.Property(ss => ss.State)
            .HasMaxLength(100);

        builder.Property(ss => ss.Pincode)
            .HasMaxLength(10);

        builder.Property(ss => ss.Phone)
            .HasMaxLength(20);

        builder.Property(ss => ss.Email)
            .HasMaxLength(100);

        builder.Property(ss => ss.PackingCharges)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(ss => ss.HomeDeliveryCharges)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(ss => ss.PointsPerHundredRupees)
            .IsRequired();
    }
}

