using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Queries.Customers;

public class GetCustomerPurchaseHistoryQueryHandler : IRequestHandler<GetCustomerPurchaseHistoryQuery, SaleListResponseDto>
{
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<Product> _productRepository;

    public GetCustomerPurchaseHistoryQueryHandler(
        IRepository<Sale> saleRepository,
        IRepository<Product> productRepository)
    {
        _saleRepository = saleRepository;
        _productRepository = productRepository;
    }

    public async Task<SaleListResponseDto> Handle(GetCustomerPurchaseHistoryQuery request, CancellationToken cancellationToken)
    {
        var allSales = await _saleRepository.GetAllAsync(cancellationToken);
        var sales = allSales
            .Where(s => s.CustomerId == request.CustomerId && s.Status == SaleStatus.Completed)
            .AsQueryable()
            .ToList()
            .AsQueryable(); // Materialize to load navigation properties

        // Filter by date range
        if (request.StartDate.HasValue)
        {
            sales = sales.Where(s => s.SaleDate >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            sales = sales.Where(s => s.SaleDate <= request.EndDate.Value);
        }

        var totalCount = sales.Count();

        var pagedSales = sales
            .OrderByDescending(s => s.SaleDate)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var allProducts = await _productRepository.GetAllAsync(cancellationToken);
        var productLookup = allProducts.ToDictionary(p => p.Id, p => p);

        var saleDtos = pagedSales.Select(s => new SaleDto
        {
            Id = s.Id,
            InvoiceNumber = s.InvoiceNumber,
            CustomerId = s.CustomerId,
            CustomerPhone = s.CustomerPhone,
            SaleDate = s.SaleDate,
            SubTotal = s.SubTotal,
            DiscountAmount = s.DiscountAmount,
            TotalAmount = s.TotalAmount,
            PaymentMethod = s.PaymentMethod,
            Status = s.Status.ToString(),
            Items = s.Items.Select(item =>
            {
                var product = productLookup.GetValueOrDefault(item.ProductId);
                return new SaleItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = product?.Name ?? "Unknown",
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.TotalPrice
                };
            }).ToList()
        }).ToList();

        return new SaleListResponseDto
        {
            Items = saleDtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}

