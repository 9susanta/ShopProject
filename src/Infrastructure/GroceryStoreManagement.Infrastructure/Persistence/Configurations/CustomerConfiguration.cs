using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Phone)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(c => c.Email)
            .HasMaxLength(100);

        builder.Property(c => c.Address)
            .HasMaxLength(500);

        builder.Property(c => c.LoyaltyPoints)
            .IsRequired();

        builder.Property(c => c.PayLaterBalance)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(c => c.PayLaterLimit)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.HasIndex(c => c.Phone)
            .IsUnique();
    }
}

