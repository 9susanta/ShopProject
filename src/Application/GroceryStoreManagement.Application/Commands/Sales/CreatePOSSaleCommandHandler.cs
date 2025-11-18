using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Events;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using InventoryEntity = GroceryStoreManagement.Domain.Entities.Inventory;
using StoreSettingsEntity = GroceryStoreManagement.Domain.Entities.StoreSettings;

namespace GroceryStoreManagement.Application.Commands.Sales;

public class CreatePOSSaleCommandHandler : IRequestHandler<CreatePOSSaleCommand, SaleDto>
{
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<Customer> _customerRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<InventoryEntity> _inventoryRepository;
    private readonly IRepository<Offer> _offerRepository;
    private readonly IRepository<StoreSettingsEntity> _storeSettingsRepository;
    private readonly IRepository<PayLaterLedger> _payLaterLedgerRepository;
    private readonly IRepository<CustomerSavedItem> _customerSavedItemRepository;
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cacheService;
    private readonly IPdfService _pdfService;
    private readonly IFileStorageService _fileStorageService;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CreatePOSSaleCommandHandler> _logger;

    public CreatePOSSaleCommandHandler(
        IRepository<Sale> saleRepository,
        IRepository<Customer> customerRepository,
        IRepository<Product> productRepository,
        IRepository<InventoryEntity> inventoryRepository,
        IRepository<Offer> offerRepository,
        IRepository<StoreSettingsEntity> storeSettingsRepository,
        IRepository<PayLaterLedger> payLaterLedgerRepository,
        IRepository<CustomerSavedItem> customerSavedItemRepository,
        IMediator mediator,
        IUnitOfWork unitOfWork,
        ICacheService cacheService,
        IPdfService pdfService,
        IFileStorageService fileStorageService,
        IServiceProvider serviceProvider,
        ILogger<CreatePOSSaleCommandHandler> logger)
    {
        _saleRepository = saleRepository;
        _customerRepository = customerRepository;
        _productRepository = productRepository;
        _inventoryRepository = inventoryRepository;
        _offerRepository = offerRepository;
        _storeSettingsRepository = storeSettingsRepository;
        _payLaterLedgerRepository = payLaterLedgerRepository;
        _customerSavedItemRepository = customerSavedItemRepository;
        _mediator = mediator;
        _unitOfWork = unitOfWork;
        _cacheService = cacheService;
        _pdfService = pdfService;
        _fileStorageService = fileStorageService;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task<SaleDto> Handle(CreatePOSSaleCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating POS sale for customer: {CustomerPhone}", request.CustomerPhone);

        // Use transaction with serializable isolation to prevent inventory race conditions
        await _unitOfWork.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, cancellationToken);
        
        try
        {
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

            // Process items and validate inventory within transaction
            var inventoryChecks = new List<(InventoryEntity inventory, int quantity)>();
            
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
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    throw new InvalidOperationException($"Product not found for item: {itemRequest.ProductId} or barcode: {itemRequest.Barcode}");
                }

                // Check inventory within transaction (prevents race condition)
                var inventoryList = await _inventoryRepository.FindAsync(i => i.ProductId == product.Id, cancellationToken);
                var inventory = inventoryList.FirstOrDefault();
                if (inventory == null || inventory.AvailableQuantity < itemRequest.Quantity)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    throw new InvalidOperationException($"Insufficient stock for product {product.Name}. Available: {inventory?.AvailableQuantity ?? 0}, Requested: {itemRequest.Quantity}");
                }
                
                // Store inventory check for later reduction
                inventoryChecks.Add((inventory, itemRequest.Quantity));

                // Get unit price (override if provided)
                var unitPrice = itemRequest.OverridePrice ?? product.SalePrice;

                // Get GST rates from product's tax slab (split equally between CGST and SGST)
                var totalGSTRate = product.TaxSlab?.Rate ?? 0;
                var cgstRate = totalGSTRate / 2; // CGST is half of total GST
                var sgstRate = totalGSTRate / 2; // SGST is half of total GST

                // Check for applicable offers (product/category specific or coupon code)
                decimal discountAmount = 0;
                Guid? offerId = null;
                var allOffersList = await _offerRepository.GetAllAsync(cancellationToken);
                
                // First check for coupon code offers
                Offer? applicableOffer = null;
                if (!string.IsNullOrWhiteSpace(request.CouponCode))
                {
                    applicableOffer = allOffersList.FirstOrDefault(o => 
                        o.CouponCode != null && 
                        o.CouponCode.Equals(request.CouponCode, StringComparison.OrdinalIgnoreCase) &&
                        (o.ProductId == product.Id || o.CategoryId == product.CategoryId || (o.ProductId == null && o.CategoryId == null)) &&
                        o.IsValid());
                }
                
                // If no coupon offer, check for auto-apply offers
                if (applicableOffer == null)
                {
                    var autoApplyOffers = allOffersList.Where(o => 
                        (o.ProductId == product.Id || o.CategoryId == product.CategoryId) && 
                        o.IsValid() &&
                        string.IsNullOrWhiteSpace(o.CouponCode)).ToList(); // Auto-apply offers don't have coupon codes

                    applicableOffer = autoApplyOffers.FirstOrDefault();
                }
                
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
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    throw new InvalidOperationException($"Insufficient loyalty points. Available: {customer.LoyaltyPoints}, Requested: {request.LoyaltyPointsToRedeem}");
                }

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

            // Reduce inventory atomically within transaction (prevents race condition)
            foreach (var (inventory, quantity) in inventoryChecks)
            {
                // Re-check inventory right before reduction (double-check pattern)
                if (inventory.AvailableQuantity < quantity)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    throw new InvalidOperationException($"Insufficient stock. Available: {inventory.AvailableQuantity}, Requested: {quantity}");
                }
                
                inventory.RemoveStock(quantity);
                await _inventoryRepository.UpdateAsync(inventory, cancellationToken);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            // Raise domain events (inventory already reduced in transaction above)
            // Note: UpdateStockOnSaleCompletedHandler will still run but should be idempotent
            var items = sale.Items.Select(i => new SaleCompletedEvent.SaleItem(i.ProductId, i.Quantity, i.UnitPrice)).ToList();
            var saleCompletedEvent = new SaleCompletedEvent(
                sale.Id,
                sale.InvoiceNumber,
                sale.SaleDate,
                sale.TotalAmount,
                items);

            await _mediator.Publish(saleCompletedEvent, cancellationToken);

            // Raise loyalty points event if customer exists
            int? pointsEarnedForSale = null;
            if (customer != null && sale.TotalAmount > 0)
            {
                var pointsPerHundred = storeSettings?.PointsPerHundredRupees ?? 1;
                var pointsEarned = (int)(sale.TotalAmount / 100) * pointsPerHundred;
                pointsEarnedForSale = pointsEarned;
                
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

            // Handle pay later if used
            if (request.PayLaterAmount > 0 && customer != null)
            {
                customer.AddPayLaterBalance(request.PayLaterAmount);
                
                // Create pay later ledger entry
                var ledgerEntry = new PayLaterLedger(
                    customer.Id,
                    "Sale",
                    request.PayLaterAmount,
                    customer.PayLaterBalance,
                    sale.Id,
                    $"Sale: {sale.InvoiceNumber}");
                await _payLaterLedgerRepository.AddAsync(ledgerEntry, cancellationToken);
                
                var payLaterEvent = new PayLaterUsedEvent(
                    customer.Id,
                    customer.Phone,
                    sale.Id,
                    sale.InvoiceNumber,
                    request.PayLaterAmount,
                    customer.PayLaterBalance);

                await _mediator.Publish(payLaterEvent, cancellationToken);
            }

            // Track customer saved items (frequently purchased)
            if (customer != null)
            {
                foreach (var item in sale.Items)
                {
                    var existingSavedItem = (await _customerSavedItemRepository.GetAllAsync(cancellationToken))
                        .FirstOrDefault(si => si.CustomerId == customer.Id && si.ProductId == item.ProductId);
                    
                    if (existingSavedItem != null)
                    {
                        existingSavedItem.IncrementPurchaseCount();
                    }
                    else
                    {
                        var savedItem = new CustomerSavedItem(customer.Id, item.ProductId);
                        savedItem.IncrementPurchaseCount();
                        await _customerSavedItemRepository.AddAsync(savedItem, cancellationToken);
                    }
                }
            }

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

            // Send notification to customer if phone number available (async, don't block)
            if (!string.IsNullOrWhiteSpace(sale.CustomerPhone) && customer != null)
            {
                _ = Task.Run(async () =>
                {
                    try
                    {
                        using var scope = _serviceProvider.CreateScope();
                        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                        await notificationService.NotifySaleCompletedAsync(
                            sale.CustomerPhone,
                            sale.InvoiceNumber,
                            sale.TotalAmount,
                            pointsEarnedForSale,
                            cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to send sale completion notification");
                    }
                }, cancellationToken);
            }

            // Load offers for sale items
            var offerIds = sale.Items.Where(i => i.OfferId.HasValue).Select(i => i.OfferId!.Value).Distinct().ToList();
            var appliedOffers = offerIds.Any()
                ? (await _offerRepository.FindAsync(o => offerIds.Contains(o.Id), cancellationToken)).ToList()
                : new List<Offer>();
            var offerLookup = appliedOffers.ToDictionary(o => o.Id);

            // Generate PDF invoice (async, don't block response)
            string? pdfUrl = null;
            try
            {
                var pdfPath = await _pdfService.GenerateInvoicePdfAsync(sale.Id, sale.InvoiceNumber, cancellationToken);
                pdfUrl = _fileStorageService.GetFileUrl(pdfPath);
                _logger.LogInformation("PDF invoice generated: {PdfPath}", pdfPath);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not generate PDF invoice, will be available later via API endpoint");
            }

            return new SaleDto
            {
                Id = sale.Id,
                InvoiceNumber = sale.InvoiceNumber,
                CustomerId = sale.CustomerId,
                CustomerName = customer?.Name,
                CustomerPhone = sale.CustomerPhone,
                Status = sale.Status.ToString(),
                SaleDate = sale.SaleDate,
                SubTotal = sale.SubTotal,
                TaxAmount = sale.TotalGSTAmount,
                DiscountAmount = sale.DiscountAmount,
                TotalAmount = sale.TotalAmount,
                PaymentMethod = sale.PaymentMethod,
                CashAmount = sale.CashAmount,
                UPIAmount = sale.UPIAmount,
                CardAmount = sale.CardAmount,
                PayLaterAmount = sale.PayLaterAmount,
                Notes = null,
                LoyaltyPointsEarned = pointsEarnedForSale,
                LoyaltyPointsRedeemed = request.LoyaltyPointsToRedeem > 0 ? (int)request.LoyaltyPointsToRedeem : null,
                PdfUrl = pdfUrl,
                Items = sale.Items.Select(i =>
                {
                    var offer = i.OfferId.HasValue ? offerLookup.GetValueOrDefault(i.OfferId.Value) : null;
                    return new SaleItemDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.Product?.Name ?? "Unknown",
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        TotalPrice = i.TotalPrice,
                        DiscountAmount = i.DiscountAmount > 0 ? i.DiscountAmount : null,
                        OfferId = i.OfferId,
                        OfferName = offer?.Name
                    };
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            _logger.LogError(ex, "Error creating POS sale for customer: {CustomerPhone}", request.CustomerPhone);
            throw;
        }
    }
}

