using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class TaxSlabConfiguration : IEntityTypeConfiguration<TaxSlab>
{
    public void Configure(EntityTypeBuilder<TaxSlab> builder)
    {
        builder.ToTable("TaxSlabs");

        builder.HasKey(ts => ts.Id);

        builder.Property(ts => ts.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(ts => ts.Rate)
            .HasColumnType("decimal(5,2)")
            .IsRequired();

        builder.Property(ts => ts.IsDefault)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(ts => ts.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        // Index to ensure only one default tax slab at a time (enforced in application logic)
        builder.HasIndex(ts => ts.IsDefault)
            .HasFilter("[IsDefault] = 1");
    }
}

