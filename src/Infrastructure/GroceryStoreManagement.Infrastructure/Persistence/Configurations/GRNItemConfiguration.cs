using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class GRNItemConfiguration : IEntityTypeConfiguration<GRNItem>
{
    public void Configure(EntityTypeBuilder<GRNItem> builder)
    {
        builder.ToTable("GRNItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.GRNId)
            .IsRequired();

        builder.Property(i => i.ProductId)
            .IsRequired();

        builder.Property(i => i.Quantity)
            .IsRequired();

        builder.Property(i => i.UnitCost)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(i => i.BatchNumber)
            .HasMaxLength(100);

        builder.HasOne(i => i.GoodsReceiveNote)
            .WithMany(grn => grn.Items)
            .HasForeignKey(i => i.GRNId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

