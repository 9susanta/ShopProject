using System;
using Microsoft.EntityFrameworkCore.Migrations;
using GroceryStoreManagement.Domain.Enums;

#nullable disable

namespace GroceryStoreManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedMasterData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Seed TaxSlabs
            var taxSlab0Id = Guid.NewGuid();
            var taxSlab5Id = Guid.NewGuid();
            var taxSlab12Id = Guid.NewGuid();
            var taxSlab18Id = Guid.NewGuid();

            migrationBuilder.InsertData(
                table: "TaxSlabs",
                columns: new[] { "Id", "Name", "Rate", "IsDefault", "IsActive", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy" },
                values: new object[,]
                {
                    { taxSlab0Id, "GST 0%", 0m, false, true, DateTime.UtcNow, null, null, null },
                    { taxSlab5Id, "GST 5%", 5m, true, true, DateTime.UtcNow, null, null, null },
                    { taxSlab12Id, "GST 12%", 12m, false, true, DateTime.UtcNow, null, null, null },
                    { taxSlab18Id, "GST 18%", 18m, false, true, DateTime.UtcNow, null, null, null }
                });

            // Seed Units
            var unitKgId = Guid.NewGuid();
            var unitGmId = Guid.NewGuid();
            var unitLitreId = Guid.NewGuid();
            var unitMlId = Guid.NewGuid();
            var unitPieceId = Guid.NewGuid();

            migrationBuilder.InsertData(
                table: "Units",
                columns: new[] { "Id", "Name", "Symbol", "Type", "SortOrder", "IsActive", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy" },
                values: new object[,]
                {
                    { unitKgId, "Kilogram", "kg", (int)UnitType.Kilogram, 1, true, DateTime.UtcNow, null, null, null },
                    { unitGmId, "Gram", "gm", (int)UnitType.Gram, 2, true, DateTime.UtcNow, null, null, null },
                    { unitLitreId, "Litre", "L", (int)UnitType.Litre, 3, true, DateTime.UtcNow, null, null, null },
                    { unitMlId, "Millilitre", "ml", (int)UnitType.Millilitre, 4, true, DateTime.UtcNow, null, null, null },
                    { unitPieceId, "Piece", "pc", (int)UnitType.Piece, 5, true, DateTime.UtcNow, null, null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove seed data (by name pattern)
            migrationBuilder.Sql("DELETE FROM TaxSlabs WHERE Name IN ('GST 0%', 'GST 5%', 'GST 12%', 'GST 18%')");
            migrationBuilder.Sql("DELETE FROM Units WHERE Name IN ('Kilogram', 'Gram', 'Litre', 'Millilitre', 'Piece')");
        }
    }
}

