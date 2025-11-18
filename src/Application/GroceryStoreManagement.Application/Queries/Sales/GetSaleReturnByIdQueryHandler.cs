using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Sales;

public class GetSaleReturnByIdQueryHandler : IRequestHandler<GetSaleReturnByIdQuery, SaleReturnDto?>
{
    private readonly IRepository<SaleReturn> _saleReturnRepository;
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<SaleItem> _saleItemRepository;
    private readonly IRepository<Domain.Entities.Product> _productRepository;
    private readonly IRepository<User> _userRepository;
    private readonly ILogger<GetSaleReturnByIdQueryHandler> _logger;

    public GetSaleReturnByIdQueryHandler(
        IRepository<SaleReturn> saleReturnRepository,
        IRepository<Sale> saleRepository,
        IRepository<SaleItem> saleItemRepository,
        IRepository<Domain.Entities.Product> productRepository,
        IRepository<User> userRepository,
        ILogger<GetSaleReturnByIdQueryHandler> logger)
    {
        _saleReturnRepository = saleReturnRepository;
        _saleRepository = saleRepository;
        _saleItemRepository = saleItemRepository;
        _productRepository = productRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<SaleReturnDto?> Handle(GetSaleReturnByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving sale return: {ReturnId}", request.Id);

        var saleReturn = await _saleReturnRepository.GetByIdAsync(request.Id, cancellationToken);
        if (saleReturn == null)
            return null;

        // Load related data
        var userLookup = new Dictionary<Guid, User>();
        var userIds = new List<Guid>();
        if (saleReturn.ProcessedByUserId.HasValue)
            userIds.Add(saleReturn.ProcessedByUserId.Value);
        if (saleReturn.Refund?.ProcessedByUserId.HasValue == true)
            userIds.Add(saleReturn.Refund.ProcessedByUserId.Value);

        if (userIds.Any())
        {
            var users = await _userRepository.FindAsync(u => userIds.Contains(u.Id), cancellationToken);
            foreach (var user in users)
                userLookup[user.Id] = user;
        }

        // Load sale
        var sale = await _saleRepository.GetByIdAsync(saleReturn.SaleId, cancellationToken);
        var saleLookup = sale != null ? new Dictionary<Guid, Sale> { [sale.Id] = sale } : new Dictionary<Guid, Sale>();

        // Load sale items and products
        var saleItemIds = saleReturn.Items.Select(i => i.SaleItemId).ToList();
        var saleItems = saleItemIds.Any()
            ? (await _saleItemRepository.FindAsync(si => saleItemIds.Contains(si.Id), cancellationToken)).ToList()
            : new List<SaleItem>();
        var saleItemLookup = saleItems.ToDictionary(si => si.Id);

        var productIds = saleItems.Select(si => si.ProductId).Distinct().ToList();
        var products = productIds.Any()
            ? (await _productRepository.FindAsync(p => productIds.Contains(p.Id), cancellationToken)).ToList()
            : new List<Domain.Entities.Product>();
        var productLookup = products.ToDictionary(p => p.Id);

        return MapToDto(saleReturn, userLookup, saleLookup, saleItemLookup, productLookup);
    }

    private SaleReturnDto MapToDto(
        SaleReturn saleReturn,
        Dictionary<Guid, User> userLookup,
        Dictionary<Guid, Sale> saleLookup,
        Dictionary<Guid, SaleItem> saleItemLookup,
        Dictionary<Guid, Domain.Entities.Product> productLookup)
    {
        var processedBy = saleReturn.ProcessedByUserId.HasValue && userLookup.ContainsKey(saleReturn.ProcessedByUserId.Value)
            ? userLookup[saleReturn.ProcessedByUserId.Value]
            : null;

        return new SaleReturnDto
        {
            Id = saleReturn.Id,
            ReturnNumber = saleReturn.ReturnNumber,
            SaleId = saleReturn.SaleId,
            SaleInvoiceNumber = saleLookup.GetValueOrDefault(saleReturn.SaleId)?.InvoiceNumber ?? string.Empty,
            ReturnDate = saleReturn.ReturnDate,
            Reason = saleReturn.Reason,
            Status = saleReturn.Status,
            TotalRefundAmount = saleReturn.TotalRefundAmount,
            Notes = saleReturn.Notes,
            ProcessedByUserId = saleReturn.ProcessedByUserId,
            ProcessedByUserName = processedBy?.Name,
            ProcessedAt = saleReturn.ProcessedAt,
            CreatedAt = saleReturn.CreatedAt,
            UpdatedAt = saleReturn.UpdatedAt,
            Items = saleReturn.Items.Select(i =>
            {
                var saleItem = saleItemLookup.GetValueOrDefault(i.SaleItemId);
                var product = saleItem != null && productLookup.ContainsKey(saleItem.ProductId)
                    ? productLookup[saleItem.ProductId]
                    : null;

                return new SaleReturnItemDto
                {
                    Id = i.Id,
                    SaleItemId = i.SaleItemId,
                    ProductId = saleItem?.ProductId ?? Guid.Empty,
                    ProductName = product?.Name ?? "Unknown",
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TotalRefundAmount = i.TotalRefundAmount,
                    Reason = i.Reason
                };
            }).ToList(),
            Refund = saleReturn.Refund != null ? new RefundDto
            {
                Id = saleReturn.Refund.Id,
                SaleReturnId = saleReturn.Refund.SaleReturnId,
                Amount = saleReturn.Refund.Amount,
                PaymentMethod = saleReturn.Refund.PaymentMethod,
                Status = saleReturn.Refund.Status,
                TransactionId = saleReturn.Refund.TransactionId,
                ReferenceNumber = saleReturn.Refund.ReferenceNumber,
                ProcessedAt = saleReturn.Refund.ProcessedAt,
                ProcessedByUserId = saleReturn.Refund.ProcessedByUserId,
                ProcessedByUserName = saleReturn.Refund.ProcessedByUserId.HasValue && userLookup.ContainsKey(saleReturn.Refund.ProcessedByUserId.Value)
                    ? userLookup[saleReturn.Refund.ProcessedByUserId.Value].Name
                    : null,
                Notes = saleReturn.Refund.Notes,
                CreatedAt = saleReturn.Refund.CreatedAt,
                UpdatedAt = saleReturn.Refund.UpdatedAt
            } : null
        };
    }
}

