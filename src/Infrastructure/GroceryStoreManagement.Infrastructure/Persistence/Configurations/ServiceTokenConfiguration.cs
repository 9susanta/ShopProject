using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class ServiceTokenConfiguration : IEntityTypeConfiguration<ServiceToken>
{
    public void Configure(EntityTypeBuilder<ServiceToken> builder)
    {
        builder.ToTable("ServiceTokens");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.TokenNumber)
            .IsRequired();

        builder.Property(t => t.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(t => t.Type)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(t => t.CreatedAt)
            .IsRequired();

        builder.Property(t => t.Priority)
            .IsRequired()
            .HasDefaultValue(0);

        builder.HasIndex(t => new { t.CreatedAt.Date, t.TokenNumber })
            .IsUnique();

        builder.HasOne(t => t.Customer)
            .WithMany()
            .HasForeignKey(t => t.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(t => t.ServedBy)
            .WithMany()
            .HasForeignKey(t => t.ServedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

