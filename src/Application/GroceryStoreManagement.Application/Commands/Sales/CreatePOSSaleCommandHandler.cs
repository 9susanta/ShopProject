using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Events;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;

namespace GroceryStoreManagement.Application.Commands.Sales;

public class CreatePOSSaleCommandHandler : IRequestHandler<CreatePOSSaleCommand, SaleDto>
{
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<Customer> _customerRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly IRepository<Offer> _offerRepository;
    private readonly IRepository<StoreSettings> _storeSettingsRepository;
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cacheService;
    private readonly ILogger<CreatePOSSaleCommandHandler> _logger;

    public CreatePOSSaleCommandHandler(
        IRepository<Sale> saleRepository,
        IRepository<Customer> customerRepository,
        IRepository<Product> productRepository,
        IRepository<InventoryEntity> inventoryRepository,
        IRepository<Offer> offerRepository,
        IRepository<StoreSettings> storeSettingsRepository,
        IMediator mediator,
        IUnitOfWork unitOfWork,
        ICacheService cacheService,
        ILogger<CreatePOSSaleCommandHandler> logger)
    {
        _saleRepository = saleRepository;
        _customerRepository = customerRepository;
        _productRepository = productRepository;
        _inventoryRepository = inventoryRepository;
        _offerRepository = offerRepository;
        _storeSettingsRepository = storeSettingsRepository;
        _mediator = mediator;
        _unitOfWork = unitOfWork;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<SaleDto> Handle(CreatePOSSaleCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating POS sale for customer: {CustomerPhone}", request.CustomerPhone);

        // Get or create customer
        Customer? customer = null;
        if (request.CustomerId.HasValue)
        {
            customer = await _customerRepository.GetByIdAsync(request.CustomerId.Value, cancellationToken);
        }
        else if (!string.IsNullOrWhiteSpace(request.CustomerPhone))
        {
            var customers = await _customerRepository.FindAsync(c => c.Phone == request.CustomerPhone, cancellationToken);
            customer = customers.FirstOrDefault();
            
            if (customer == null)
            {
                // Create guest customer
                customer = new Customer("Guest", request.CustomerPhone);
                await _customerRepository.AddAsync(customer, cancellationToken);
            }
        }

        // Generate invoice number
        var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
        var sale = new Sale(invoiceNumber, customer?.Id, request.CustomerPhone, request.DiscountAmount);

        // Get store settings for packing charges
        var storeSettingsList = await _storeSettingsRepository.GetAllAsync(cancellationToken);
        var storeSettings = storeSettingsList.FirstOrDefault();
        if (storeSettings != null && request.PackingCharges == 0)
        {
            sale.SetPackingCharges(storeSettings.PackingCharges);
        }
        else if (request.PackingCharges > 0)
        {
            sale.SetPackingCharges(request.PackingCharges);
        }

        // Process items
        foreach (var itemRequest in request.Items)
        {
            Product? product = null;

            // Find product by ID or barcode
            if (itemRequest.ProductId != Guid.Empty)
            {
                product = await _productRepository.GetByIdAsync(itemRequest.ProductId, cancellationToken);
            }
            else if (!string.IsNullOrWhiteSpace(itemRequest.Barcode))
            {
                var products = await _productRepository.FindAsync(p => p.Barcode == itemRequest.Barcode, cancellationToken);
                product = products.FirstOrDefault();
            }

            if (product == null)
                throw new InvalidOperationException($"Product not found for item: {itemRequest.ProductId} or barcode: {itemRequest.Barcode}");

            // Check inventory
            var inventoryList = await _inventoryRepository.FindAsync(i => i.ProductId == product.Id, cancellationToken);
            var inventory = inventoryList.FirstOrDefault();
            if (inventory == null || inventory.AvailableQuantity < itemRequest.Quantity)
                throw new InvalidOperationException($"Insufficient stock for product {product.Name}. Available: {inventory?.AvailableQuantity ?? 0}, Requested: {itemRequest.Quantity}");

            // Get unit price (override if provided)
            var unitPrice = itemRequest.OverridePrice ?? product.SalePrice;

            // Get GST rates from product's tax slab
            var cgstRate = product.TaxSlab?.CGSTRate ?? 0;
            var sgstRate = product.TaxSlab?.SGSTRate ?? 0;

            // Check for applicable offers
            decimal discountAmount = 0;
            Guid? offerId = null;
            var allOffers = await _offerRepository.GetAllAsync(cancellationToken);
            var offers = allOffers.Where(o => 
                (o.ProductId == product.Id || o.CategoryId == product.CategoryId) && 
                o.IsValid()).ToList();

            var applicableOffer = offers.FirstOrDefault();
            if (applicableOffer != null)
            {
                var itemTotal = itemRequest.Quantity * unitPrice;
                discountAmount = applicableOffer.CalculateDiscount(itemTotal, itemRequest.Quantity);
                offerId = applicableOffer.Id;
            }

            // Add item to sale
            sale.AddItem(product.Id, itemRequest.Quantity, unitPrice);
            
            // Apply GST and discount to the last added item
            var saleItem = sale.Items.Last();
            saleItem.SetGSTRates(cgstRate, sgstRate);
            if (discountAmount > 0)
            {
                saleItem.ApplyDiscount(discountAmount, offerId);
            }
        }

        // Apply loyalty points redemption
        if (customer != null && request.LoyaltyPointsToRedeem > 0)
        {
            if (customer.LoyaltyPoints < (int)request.LoyaltyPointsToRedeem)
                throw new InvalidOperationException($"Insufficient loyalty points. Available: {customer.LoyaltyPoints}, Requested: {request.LoyaltyPointsToRedeem}");

            // Convert points to rupees (1 point = ₹1)
            sale.RedeemLoyaltyPoints(request.LoyaltyPointsToRedeem);
            customer.RedeemLoyaltyPoints((int)request.LoyaltyPointsToRedeem);
        }

        // Set home delivery
        if (request.IsHomeDelivery)
        {
            var deliveryCharges = storeSettings?.HomeDeliveryCharges ?? 0;
            sale.SetHomeDelivery(true, deliveryCharges, request.DeliveryAddress);
        }

        // Set payment method
        sale.SetPaymentMethod(request.PaymentMethod, request.CashAmount, request.UPIAmount, request.CardAmount, request.PayLaterAmount);

        // Complete sale
        sale.Complete();

        await _saleRepository.AddAsync(sale, cancellationToken);

        // Create invoice
        var invoice = new Invoice(
            sale.Id,
            sale.InvoiceNumber,
            sale.SubTotal,
            sale.TotalGSTAmount,
            sale.DiscountAmount,
            sale.TotalAmount);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Raise domain events
        var items = sale.Items.Select(i => new SaleCompletedEvent.SaleItem(i.ProductId, i.Quantity, i.UnitPrice)).ToList();
        var saleCompletedEvent = new SaleCompletedEvent(
            sale.Id,
            sale.InvoiceNumber,
            sale.SaleDate,
            sale.TotalAmount,
            items);

        await _mediator.Publish(saleCompletedEvent, cancellationToken);

        // Raise loyalty points event if customer exists
        if (customer != null && sale.TotalAmount > 0)
        {
            var pointsPerHundred = storeSettings?.PointsPerHundredRupees ?? 1;
            var pointsEarned = (int)(sale.TotalAmount / 100) * pointsPerHundred;
            
            if (pointsEarned > 0)
            {
                customer.AddLoyaltyPoints(pointsEarned);
                var loyaltyEvent = new LoyaltyPointsEarnedEvent(
                    customer.Id,
                    customer.Phone,
                    sale.Id,
                    sale.InvoiceNumber,
                    pointsEarned,
                    customer.LoyaltyPoints);

                await _mediator.Publish(loyaltyEvent, cancellationToken);
            }
        }

        // Raise pay later event if used
        if (request.PayLaterAmount > 0 && customer != null)
        {
            customer.AddPayLaterBalance(request.PayLaterAmount);
            var payLaterEvent = new PayLaterUsedEvent(
                customer.Id,
                customer.Phone,
                sale.Id,
                sale.InvoiceNumber,
                request.PayLaterAmount,
                customer.PayLaterBalance);

            await _mediator.Publish(payLaterEvent, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Invalidate customer cache if customer exists
        if (customer != null)
        {
            await _cacheService.RemoveAsync($"customer:phone:{customer.Phone}", cancellationToken);
            await _cacheService.RemoveByPatternAsync("repo:Customer:*", cancellationToken);
        }

        // Invalidate inventory caches for products sold
        foreach (var item in sale.Items)
        {
            await _cacheService.RemoveByPatternAsync($"inventory:product:{item.ProductId}*", cancellationToken);
        }

        _logger.LogInformation("POS sale created successfully: {SaleId}, Invoice: {InvoiceNumber}", sale.Id, sale.InvoiceNumber);

        return new SaleDto
        {
            Id = sale.Id,
            InvoiceNumber = sale.InvoiceNumber,
            CustomerId = sale.CustomerId,
            CustomerName = customer?.Name,
            Status = sale.Status.ToString(),
            SaleDate = sale.SaleDate,
            SubTotal = sale.SubTotal,
            TaxAmount = sale.TotalGSTAmount,
            DiscountAmount = sale.DiscountAmount,
            TotalAmount = sale.TotalAmount,
            Items = sale.Items.Select(i => new SaleItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice
            }).ToList()
        };
    }
}

