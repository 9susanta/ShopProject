using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class ImportErrorConfiguration : IEntityTypeConfiguration<ImportError>
{
    public void Configure(EntityTypeBuilder<ImportError> builder)
    {
        builder.ToTable("ImportErrors");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.RowNumber)
            .IsRequired();

        builder.Property(e => e.Payload)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        builder.Property(e => e.ErrorMessage)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(e => e.FieldName)
            .HasMaxLength(200);

        builder.HasIndex(e => e.ImportJobId);
    }
}

