using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Description)
            .HasMaxLength(500);

        builder.Property(c => c.TaxSlabId)
            .IsRequired();

        builder.Property(c => c.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        // Unique constraint on Name
        builder.HasIndex(c => c.Name)
            .IsUnique();

        // Foreign key to TaxSlab
        builder.HasOne(c => c.TaxSlab)
            .WithMany(ts => ts.Categories)
            .HasForeignKey(c => c.TaxSlabId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

