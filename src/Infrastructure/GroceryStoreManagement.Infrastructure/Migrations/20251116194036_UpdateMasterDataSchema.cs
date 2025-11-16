using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GroceryStoreManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMasterDataSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_TaxSlabs_TaxSlabId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Units_UnitId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ConversionFactor",
                table: "Units");

            migrationBuilder.DropColumn(
                name: "CGSTRate",
                table: "TaxSlabs");

            migrationBuilder.RenameColumn(
                name: "SGSTRate",
                table: "TaxSlabs",
                newName: "Rate");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Units",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "Units",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "TaxSlabs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "TaxSlabs",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "TaxSlabs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<Guid>(
                name: "TaxSlabId",
                table: "Products",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Customers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Pincode",
                table: "Customers",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Categories",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            // Note: SGSTRate was already renamed to Rate above, so no need to update

            // Add TaxSlabId column to Categories (nullable first)
            migrationBuilder.AddColumn<Guid>(
                name: "TaxSlabId",
                table: "Categories",
                type: "uniqueidentifier",
                nullable: true);

            // Get or create a default TaxSlab and update all Categories to use it
            migrationBuilder.Sql(@"
                DECLARE @DefaultTaxSlabId UNIQUEIDENTIFIER;
                
                -- Try to get an existing TaxSlab (prefer one with Rate = 5, or just get the first one)
                SELECT TOP 1 @DefaultTaxSlabId = Id 
                FROM TaxSlabs 
                WHERE Rate = 5 OR Rate IS NULL
                ORDER BY CASE WHEN Rate = 5 THEN 0 ELSE 1 END;
                
                -- If no TaxSlab exists, create one
                IF @DefaultTaxSlabId IS NULL
                BEGIN
                    SET @DefaultTaxSlabId = NEWID();
                    INSERT INTO TaxSlabs (Id, Name, Rate, IsDefault, IsActive, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)
                    VALUES (@DefaultTaxSlabId, 'GST 5%', 5, 1, 1, GETUTCDATE(), NULL, NULL, NULL);
                END
                ELSE
                BEGIN
                    -- Mark it as default if not already
                    UPDATE TaxSlabs SET IsDefault = 1 WHERE Id = @DefaultTaxSlabId;
                END
                
                -- Update all Categories to use the default TaxSlab
                UPDATE Categories 
                SET TaxSlabId = @DefaultTaxSlabId 
                WHERE TaxSlabId IS NULL;
            ");

            // Now make TaxSlabId required
            migrationBuilder.AlterColumn<Guid>(
                name: "TaxSlabId",
                table: "Categories",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TaxSlabs_IsDefault",
                table: "TaxSlabs",
                column: "IsDefault",
                filter: "[IsDefault] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Barcode",
                table: "Products",
                column: "Barcode",
                unique: true,
                filter: "[Barcode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Name",
                table: "Categories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_TaxSlabId",
                table: "Categories",
                column: "TaxSlabId");

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_TaxSlabs_TaxSlabId",
                table: "Categories",
                column: "TaxSlabId",
                principalTable: "TaxSlabs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_TaxSlabs_TaxSlabId",
                table: "Products",
                column: "TaxSlabId",
                principalTable: "TaxSlabs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Units_UnitId",
                table: "Products",
                column: "UnitId",
                principalTable: "Units",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_TaxSlabs_TaxSlabId",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_TaxSlabs_TaxSlabId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Units_UnitId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_TaxSlabs_IsDefault",
                table: "TaxSlabs");

            migrationBuilder.DropIndex(
                name: "IX_Products_Barcode",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Categories_Name",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_TaxSlabId",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "Units");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "TaxSlabs");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "Pincode",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "TaxSlabId",
                table: "Categories");

            migrationBuilder.RenameColumn(
                name: "Rate",
                table: "TaxSlabs",
                newName: "SGSTRate");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Units",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ConversionFactor",
                table: "Units",
                type: "decimal(18,4)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "TaxSlabs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "TaxSlabs",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CGSTRate",
                table: "TaxSlabs",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<Guid>(
                name: "TaxSlabId",
                table: "Products",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Categories",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_TaxSlabs_TaxSlabId",
                table: "Products",
                column: "TaxSlabId",
                principalTable: "TaxSlabs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Units_UnitId",
                table: "Products",
                column: "UnitId",
                principalTable: "Units",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
