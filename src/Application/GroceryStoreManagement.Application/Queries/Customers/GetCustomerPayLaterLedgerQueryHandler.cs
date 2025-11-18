using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Application.Queries.Customers;

public class GetCustomerPayLaterLedgerQueryHandler : IRequestHandler<GetCustomerPayLaterLedgerQuery, PayLaterLedgerListResponseDto>
{
    private readonly IRepository<PayLaterLedger> _ledgerRepository;
    private readonly IRepository<Sale> _saleRepository;

    public GetCustomerPayLaterLedgerQueryHandler(
        IRepository<PayLaterLedger> ledgerRepository,
        IRepository<Sale> saleRepository)
    {
        _ledgerRepository = ledgerRepository;
        _saleRepository = saleRepository;
    }

    public async Task<PayLaterLedgerListResponseDto> Handle(GetCustomerPayLaterLedgerQuery request, CancellationToken cancellationToken)
    {
        var allLedgers = await _ledgerRepository.GetAllAsync(cancellationToken);
        var ledgers = allLedgers
            .Where(l => l.CustomerId == request.CustomerId)
            .AsQueryable()
            .ToList()
            .AsQueryable(); // Materialize to load navigation properties

        // Filter by date range
        if (request.StartDate.HasValue)
        {
            ledgers = ledgers.Where(l => l.CreatedAt >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            ledgers = ledgers.Where(l => l.CreatedAt <= request.EndDate.Value);
        }

        var totalCount = ledgers.Count();

        var pagedLedgers = ledgers
            .OrderByDescending(l => l.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var allSales = await _saleRepository.GetAllAsync(cancellationToken);
        var saleLookup = allSales.ToDictionary(s => s.Id, s => s);

        var ledgerDtos = pagedLedgers.Select(l =>
        {
            var sale = l.SaleId.HasValue ? saleLookup.GetValueOrDefault(l.SaleId.Value) : null;
            return new PayLaterLedgerEntryDto
            {
                Id = l.Id,
                CustomerId = l.CustomerId,
                CustomerName = l.Customer?.Name ?? "Unknown",
                TransactionType = l.TransactionType,
                Amount = l.Amount,
                BalanceAfter = l.BalanceAfter,
                SaleId = l.SaleId,
                SaleInvoiceNumber = sale?.InvoiceNumber,
                Description = l.Description,
                CreatedAt = l.CreatedAt
            };
        }).ToList();

        return new PayLaterLedgerListResponseDto
        {
            Items = ledgerDtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}

