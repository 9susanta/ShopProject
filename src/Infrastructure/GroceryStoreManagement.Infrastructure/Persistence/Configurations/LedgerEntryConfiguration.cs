using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GroceryStoreManagement.Infrastructure.Persistence.Configurations;

public class LedgerEntryConfiguration : IEntityTypeConfiguration<LedgerEntry>
{
    public void Configure(EntityTypeBuilder<LedgerEntry> builder)
    {
        builder.ToTable("LedgerEntries");

        builder.HasKey(le => le.Id);

        builder.Property(le => le.EntryType)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(le => le.ReferenceNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(le => le.Amount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(le => le.Description)
            .HasMaxLength(500);
    }
}

