using GroceryStoreManagement.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class AuditEntryConfiguration : IEntityTypeConfiguration<AuditEntry>
{
    public void Configure(EntityTypeBuilder<AuditEntry> builder)
    {
        builder.ToTable("AuditEntries");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.TableName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.KeyValues)
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.OldValues)
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.NewValues)
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.Operation)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(a => a.UserName)
            .HasMaxLength(200);

        builder.Property(a => a.CorrelationId)
            .HasMaxLength(100);

        builder.Property(a => a.RequestPath)
            .HasMaxLength(500);

        builder.Property(a => a.ClientIp)
            .HasMaxLength(50);

        builder.Property(a => a.Metadata)
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.TimestampUtc)
            .IsRequired();

        // Indexes are defined via attributes in AuditEntry entity
    }
}

