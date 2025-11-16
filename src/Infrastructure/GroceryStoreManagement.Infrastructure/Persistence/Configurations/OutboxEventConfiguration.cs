using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class OutboxEventConfiguration : IEntityTypeConfiguration<OutboxEvent>
{
    public void Configure(EntityTypeBuilder<OutboxEvent> builder)
    {
        builder.ToTable("OutboxEvents");

        builder.HasKey(oe => oe.Id);

        builder.Property(oe => oe.EventType)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(oe => oe.Payload)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        builder.Property(oe => oe.ErrorMessage)
            .HasMaxLength(1000);

        builder.HasIndex(oe => oe.ProcessedAt);
    }
}

