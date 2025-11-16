using GroceryStoreManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class ImportJobConfiguration : IEntityTypeConfiguration<ImportJob>
{
    public void Configure(EntityTypeBuilder<ImportJob> builder)
    {
        builder.ToTable("ImportJobs");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.FileName)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(i => i.FilePath)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(i => i.FileType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(i => i.MappingJson)
            .HasColumnType("nvarchar(max)");

        builder.Property(i => i.UpdateExistingBy)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(i => i.ErrorReportPath)
            .HasMaxLength(1000);

        builder.Property(i => i.ErrorMessage)
            .HasMaxLength(2000);

        builder.HasMany(i => i.ImportErrors)
            .WithOne(e => e.ImportJob)
            .HasForeignKey(e => e.ImportJobId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

