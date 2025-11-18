using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class CustomerSavedItemConfiguration : IEntityTypeConfiguration<CustomerSavedItem>
{
    public void Configure(EntityTypeBuilder<CustomerSavedItem> builder)
    {
        builder.ToTable("CustomerSavedItems");

        builder.HasKey(c => c.Id);

        builder.HasIndex(c => new { c.CustomerId, c.ProductId })
            .IsUnique();

        builder.HasOne(c => c.Customer)
            .WithMany()
            .HasForeignKey(c => c.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.Product)
            .WithMany()
            .HasForeignKey(c => c.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

