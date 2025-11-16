using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class UnitConfiguration : IEntityTypeConfiguration<Unit>
{
    public void Configure(EntityTypeBuilder<Unit> builder)
    {
        builder.ToTable("Units");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Symbol)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(u => u.Type)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(u => u.SortOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(u => u.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasIndex(u => u.Name)
            .IsUnique();
    }
}

