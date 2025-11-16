using FluentAssertions;
using GroceryStoreManagement.Application.Commands.Purchases;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using GroceryStoreManagement.Infrastructure.Persistence;
using GroceryStoreManagement.Infrastructure.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace GroceryStoreManagement.Tests;

public class ReceivePurchaseOrderHandlerTests
{
    [Fact]
    public async Task Handle_ShouldReceivePurchaseOrder_WhenValid()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new ApplicationDbContext(options);
        var purchaseOrderRepository = new Repository<PurchaseOrder>(context);
        var mediator = new Mock<IMediator>();
        var unitOfWork = new UnitOfWork(context);
        var logger = new Mock<ILogger<ReceivePurchaseOrderCommandHandler>>();

        var supplier = new Supplier("Test Supplier", "Contact", "test@test.com", "123", "Address");
        await context.Suppliers.AddAsync(supplier);
        await context.SaveChangesAsync();

        var purchaseOrder = new PurchaseOrder("PO-001", supplier.Id);
        purchaseOrder.AddItem(Guid.NewGuid(), 10, 5.00m);
        purchaseOrder.Submit();
        await context.PurchaseOrders.AddAsync(purchaseOrder);
        await context.SaveChangesAsync();

        var handler = new ReceivePurchaseOrderCommandHandler(
            purchaseOrderRepository,
            mediator.Object,
            unitOfWork,
            logger.Object);

        var command = new ReceivePurchaseOrderCommand
        {
            PurchaseOrderId = purchaseOrder.Id,
            ReceivedDate = DateTime.UtcNow
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Status.Should().Be(PurchaseOrderStatus.Received.ToString());
        result.ReceivedDate.Should().NotBeNull();
    }
}

