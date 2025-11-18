using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Application.Queries.Sales;

public class GetSaleReturnsQueryHandler : IRequestHandler<GetSaleReturnsQuery, List<SaleReturnDto>>
{
    private readonly IRepository<SaleReturn> _saleReturnRepository;
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<SaleItem> _saleItemRepository;
    private readonly IRepository<Domain.Entities.Product> _productRepository;
    private readonly IRepository<User> _userRepository;
    private readonly ILogger<GetSaleReturnsQueryHandler> _logger;

    public GetSaleReturnsQueryHandler(
        IRepository<SaleReturn> saleReturnRepository,
        IRepository<Sale> saleRepository,
        IRepository<SaleItem> saleItemRepository,
        IRepository<Domain.Entities.Product> productRepository,
        IRepository<User> userRepository,
        ILogger<GetSaleReturnsQueryHandler> logger)
    {
        _saleReturnRepository = saleReturnRepository;
        _saleRepository = saleRepository;
        _saleItemRepository = saleItemRepository;
        _productRepository = productRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<List<SaleReturnDto>> Handle(GetSaleReturnsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving sale returns with filters: SaleId={SaleId}, Status={Status}", 
            request.SaleId, request.Status);

        var returns = await _saleReturnRepository.GetAllAsync(cancellationToken);

        var filteredReturns = returns.AsQueryable();

        if (request.SaleId.HasValue)
        {
            filteredReturns = filteredReturns.Where(r => r.SaleId == request.SaleId.Value);
        }

        if (request.Status.HasValue)
        {
            filteredReturns = filteredReturns.Where(r => r.Status == request.Status.Value);
        }

        if (request.StartDate.HasValue)
        {
            filteredReturns = filteredReturns.Where(r => r.ReturnDate >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            filteredReturns = filteredReturns.Where(r => r.ReturnDate <= request.EndDate.Value);
        }

        var returnList = filteredReturns
            .OrderByDescending(r => r.ReturnDate)
            .ToList();

        // Load related data
        var userIds = returnList
            .Where(r => r.ProcessedByUserId.HasValue)
            .Select(r => r.ProcessedByUserId!.Value)
            .Distinct()
            .ToList();

        var users = userIds.Any()
            ? (await _userRepository.FindAsync(u => userIds.Contains(u.Id), cancellationToken)).ToList()
            : new List<User>();

        var userLookup = users.ToDictionary(u => u.Id);

        // Load sales for invoice numbers
        var saleIds = returnList.Select(r => r.SaleId).Distinct().ToList();
        var sales = saleIds.Any()
            ? (await _saleRepository.FindAsync(s => saleIds.Contains(s.Id), cancellationToken)).ToList()
            : new List<Sale>();
        var saleLookup = sales.ToDictionary(s => s.Id);

        // Load sale items and products for return items
        var allReturnItemIds = returnList.SelectMany(r => r.Items.Select(i => i.SaleItemId)).Distinct().ToList();
        var saleItems = allReturnItemIds.Any()
            ? (await _saleItemRepository.FindAsync(si => allReturnItemIds.Contains(si.Id), cancellationToken)).ToList()
            : new List<SaleItem>();
        var saleItemLookup = saleItems.ToDictionary(si => si.Id);

        var productIds = saleItems.Select(si => si.ProductId).Distinct().ToList();
        var products = productIds.Any()
            ? (await _productRepository.FindAsync(p => productIds.Contains(p.Id), cancellationToken)).ToList()
            : new List<Domain.Entities.Product>();
        var productLookup = products.ToDictionary(p => p.Id);

        return returnList.Select(r => MapToDto(r, userLookup, saleLookup, saleItemLookup, productLookup)).ToList();
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
                ProcessedByUserName = saleReturn.Refund.ProcessedByUserId.HasValue && userLookup.ContainsKey(saleReturn.Refund.ProcessedByUserId!.Value)
                    ? userLookup[saleReturn.Refund.ProcessedByUserId!.Value].Name
                    : null,
                Notes = saleReturn.Refund.Notes,
                CreatedAt = saleReturn.Refund.CreatedAt,
                UpdatedAt = saleReturn.Refund.UpdatedAt
            } : null
        };
    }
}

