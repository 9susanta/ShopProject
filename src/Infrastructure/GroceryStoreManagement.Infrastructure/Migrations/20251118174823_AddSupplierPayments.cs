using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GroceryStoreManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSupplierPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add ReorderPoint column if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'ReorderPoint')
                BEGIN
                    ALTER TABLE Products ADD ReorderPoint int NOT NULL DEFAULT 0;
                END
            ");

            // Add SuggestedReorderQuantity column if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'SuggestedReorderQuantity')
                BEGIN
                    ALTER TABLE Products ADD SuggestedReorderQuantity int NOT NULL DEFAULT 0;
                END
            ");

            // Create Permissions table if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Permissions')
                BEGIN
                    CREATE TABLE Permissions (
                        Id uniqueidentifier NOT NULL PRIMARY KEY,
                        Name nvarchar(100) NOT NULL,
                        Description nvarchar(500) NOT NULL,
                        Category nvarchar(50) NOT NULL,
                        CreatedAt datetime2 NOT NULL,
                        UpdatedAt datetime2 NULL,
                        CreatedBy nvarchar(max) NULL,
                        UpdatedBy nvarchar(max) NULL
                    );
                    CREATE UNIQUE INDEX IX_Permissions_Name ON Permissions(Name);
                END
            ");

            // Create SupplierPayments table if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'SupplierPayments')
                BEGIN
                    CREATE TABLE SupplierPayments (
                        Id uniqueidentifier NOT NULL PRIMARY KEY,
                        SupplierId uniqueidentifier NOT NULL,
                        PurchaseOrderId uniqueidentifier NULL,
                        GRNId uniqueidentifier NULL,
                        Amount decimal(18,2) NOT NULL,
                        PaymentMethod int NOT NULL,
                        PaymentDate datetime2 NOT NULL,
                        ReferenceNumber nvarchar(100) NULL,
                        Notes nvarchar(500) NULL,
                        CreatedBy uniqueidentifier NOT NULL,
                        CreatedAt datetime2 NOT NULL,
                        UpdatedAt datetime2 NULL,
                        UpdatedBy nvarchar(max) NULL,
                        FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id),
                        FOREIGN KEY (PurchaseOrderId) REFERENCES PurchaseOrders(Id) ON DELETE SET NULL,
                        FOREIGN KEY (GRNId) REFERENCES GoodsReceiveNotes(Id) ON DELETE SET NULL
                    );
                    CREATE INDEX IX_SupplierPayments_SupplierId ON SupplierPayments(SupplierId);
                    CREATE INDEX IX_SupplierPayments_PurchaseOrderId ON SupplierPayments(PurchaseOrderId);
                    CREATE INDEX IX_SupplierPayments_GRNId ON SupplierPayments(GRNId);
                    CREATE INDEX IX_SupplierPayments_PaymentDate ON SupplierPayments(PaymentDate);
                END
            ");

            // Create RolePermissions table if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'RolePermissions')
                BEGIN
                    CREATE TABLE RolePermissions (
                        Id uniqueidentifier NOT NULL PRIMARY KEY,
                        RoleName nvarchar(50) NOT NULL,
                        PermissionId uniqueidentifier NOT NULL,
                        CreatedAt datetime2 NOT NULL,
                        UpdatedAt datetime2 NULL,
                        CreatedBy nvarchar(max) NULL,
                        UpdatedBy nvarchar(max) NULL,
                        FOREIGN KEY (PermissionId) REFERENCES Permissions(Id) ON DELETE CASCADE
                    );
                    CREATE INDEX IX_RolePermissions_PermissionId ON RolePermissions(PermissionId);
                    CREATE UNIQUE INDEX IX_RolePermissions_RoleName_PermissionId ON RolePermissions(RoleName, PermissionId);
                END
            ");
            // Tables are created via SQL above - no CreateTable needed
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "SupplierPayments");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropColumn(
                name: "ReorderPoint",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SuggestedReorderQuantity",
                table: "Products");
        }
    }
}
