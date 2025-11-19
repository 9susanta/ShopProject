using FluentAssertions;
using GroceryStoreManagement.Application.EventHandlers;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using GroceryStoreManagement.Domain.Events;
using GroceryStoreManagement.Infrastructure.Persistence;
using GroceryStoreManagement.Infrastructure.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using UnitEntity = GroceryStoreManagement.Domain.Entities.Unit;

namespace GroceryStoreManagement.Tests;

public class UpdateStockOnPurchaseReceivedHandlerTests
{
    [Fact]
    public async Task Handle_ShouldUpdateInventory_WhenPurchaseReceived()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new ApplicationDbContext(options);
        var inventoryRepository = new Repository<Inventory>(context);
        var productRepository = new Repository<Product>(context);
        var unitOfWork = new UnitOfWork(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<UpdateStockOnPurchaseReceivedHandler>>();

        var taxSlab = new TaxSlab("5% GST", 5m, false);
        await context.TaxSlabs.AddAsync(taxSlab);
        await context.SaveChangesAsync();

        var category = new Category("Test Category", taxSlab.Id);
        await context.Categories.AddAsync(category);
        await context.SaveChangesAsync();

        var unit = new UnitEntity("Piece", "pcs", UnitType.Piece, 1);
        await context.Units.AddAsync(unit);
        await context.SaveChangesAsync();

        var product = new Product("Test Product", "SKU-001", 12.00m, 10.00m, category.Id, unit.Id, description: null, barcode: null, imageUrl: null, lowStockThreshold: 10, isWeightBased: false, weightPerUnit: null, taxSlabId: taxSlab.Id);
        await context.Products.AddAsync(product);
        await context.SaveChangesAsync();

        var inventory = new Inventory(product.Id, 50);
        await context.Inventories.AddAsync(inventory);
        await context.SaveChangesAsync();

        var handler = new UpdateStockOnPurchaseReceivedHandler(
            inventoryRepository,
            productRepository,
            unitOfWork,
            mediator.Object,
            logger.Object);

        var @event = new PurchaseReceivedEvent(
            Guid.NewGuid(),
            "PO-001",
            DateTime.UtcNow,
            new List<PurchaseReceivedEvent.PurchaseItem>
            {
                new PurchaseReceivedEvent.PurchaseItem(product.Id, 20, 8.00m)
            });

        // Act
        await handler.Handle(@event, CancellationToken.None);

        // Assert
        var updatedInventory = await context.Inventories.FindAsync(inventory.Id);
        updatedInventory.Should().NotBeNull();
        updatedInventory!.QuantityOnHand.Should().Be(70); // 50 + 20
    }
}

