using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Queries.Sales;
using GroceryStoreManagement.Application.Queries.Purchases;
using MediatR;
using Microsoft.Extensions.Logging;
using ClosedXML.Excel;

namespace GroceryStoreManagement.Infrastructure.Services;

public class GSTExportService : IGSTExportService
{
    private readonly IMediator _mediator;
    private readonly ILogger<GSTExportService> _logger;

    public GSTExportService(IMediator mediator, ILogger<GSTExportService> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<byte[]> ExportGSTR1Async(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Exporting GSTR-1 from {FromDate} to {ToDate}", fromDate, toDate);

        var salesQuery = new GetSalesQuery
        {
            FromDate = fromDate,
            ToDate = toDate,
            PageSize = 10000 // Get all sales
        };
        var salesResponse = await _mediator.Send(salesQuery, cancellationToken);

        var gstr1Data = new GSTR1ExportDto
        {
            FromDate = fromDate,
            ToDate = toDate,
            Invoices = salesResponse.Items.Select(s => new GSTR1InvoiceDto
            {
                InvoiceNumber = s.InvoiceNumber,
                InvoiceDate = s.SaleDate,
                CustomerName = s.CustomerName ?? "Walk-in",
                TaxableValue = s.SubTotal,
                CGST = s.TaxAmount / 2, // Assuming equal CGST/SGST split
                SGST = s.TaxAmount / 2,
                IGST = 0, // Set based on business logic (inter-state vs intra-state)
                TotalTax = s.TaxAmount,
                TotalAmount = s.TotalAmount,
                Items = s.Items.Select(i => new GSTR1ItemDto
                {
                    ProductName = i.ProductName,
                    HSNCode = "", // TODO: Add HSN code to product
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TaxableValue = i.TotalPrice - (i.DiscountAmount ?? 0),
                    TaxRate = s.TaxAmount > 0 ? (s.TaxAmount / s.SubTotal) * 100 : 0,
                    CGST = (s.TaxAmount / 2) * (i.TotalPrice / s.SubTotal),
                    SGST = (s.TaxAmount / 2) * (i.TotalPrice / s.SubTotal),
                    IGST = 0
                }).ToList()
            }).ToList()
        };

        return GenerateGSTR1Excel(gstr1Data);
    }

    public async Task<byte[]> ExportGSTR2Async(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Exporting GSTR-2 from {FromDate} to {ToDate}", fromDate, toDate);

        var grnsQuery = new GetGRNsQuery
        {
            StartDate = fromDate,
            EndDate = toDate,
            PageSize = 10000 // Get all GRNs
        };
        var grnsResponse = await _mediator.Send(grnsQuery, cancellationToken);

        var gstr2Data = new GSTR2ExportDto
        {
            FromDate = fromDate,
            ToDate = toDate,
            Purchases = grnsResponse.Items.Select(g => new GSTR2PurchaseDto
            {
                GRNNumber = g.GRNNumber,
                PurchaseDate = g.ReceivedDate,
                SupplierName = $"Supplier-{g.SupplierId}", // TODO: Load supplier name
                InvoiceNumber = g.InvoiceNumber,
                TaxableValue = g.TotalAmount, // Assuming total includes tax, adjust as needed
                CGST = 0, // Calculate based on tax slabs
                SGST = 0,
                IGST = 0,
                TotalTax = 0,
                TotalAmount = g.TotalAmount,
                Items = g.Items.Select(i => new GSTR2ItemDto
                {
                    ProductName = i.ProductName,
                    HSNCode = "", // TODO: Add HSN code to product
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitCost,
                    TaxableValue = i.TotalCost,
                    TaxRate = 0, // Calculate from tax slab
                    CGST = 0,
                    SGST = 0,
                    IGST = 0
                }).ToList()
            }).ToList()
        };

        return GenerateGSTR2Excel(gstr2Data);
    }

    private byte[] GenerateGSTR1Excel(GSTR1ExportDto data)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("GSTR-1");

        // Header
        worksheet.Cell(1, 1).Value = "GSTR-1 Export";
        worksheet.Cell(2, 1).Value = $"From Date: {data.FromDate:yyyy-MM-dd}";
        worksheet.Cell(2, 2).Value = $"To Date: {data.ToDate:yyyy-MM-dd}";

        // Column headers
        int row = 4;
        worksheet.Cell(row, 1).Value = "Invoice Number";
        worksheet.Cell(row, 2).Value = "Invoice Date";
        worksheet.Cell(row, 3).Value = "Customer Name";
        worksheet.Cell(row, 4).Value = "Customer GSTIN";
        worksheet.Cell(row, 5).Value = "Taxable Value";
        worksheet.Cell(row, 6).Value = "CGST";
        worksheet.Cell(row, 7).Value = "SGST";
        worksheet.Cell(row, 8).Value = "IGST";
        worksheet.Cell(row, 9).Value = "Total Tax";
        worksheet.Cell(row, 10).Value = "Total Amount";

        row++;
        foreach (var invoice in data.Invoices)
        {
            worksheet.Cell(row, 1).Value = invoice.InvoiceNumber;
            worksheet.Cell(row, 2).Value = invoice.InvoiceDate;
            worksheet.Cell(row, 3).Value = invoice.CustomerName;
            worksheet.Cell(row, 4).Value = invoice.CustomerGSTIN ?? "";
            worksheet.Cell(row, 5).Value = invoice.TaxableValue;
            worksheet.Cell(row, 6).Value = invoice.CGST;
            worksheet.Cell(row, 7).Value = invoice.SGST;
            worksheet.Cell(row, 8).Value = invoice.IGST;
            worksheet.Cell(row, 9).Value = invoice.TotalTax;
            worksheet.Cell(row, 10).Value = invoice.TotalAmount;
            row++;
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private byte[] GenerateGSTR2Excel(GSTR2ExportDto data)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("GSTR-2");

        // Header
        worksheet.Cell(1, 1).Value = "GSTR-2 Export";
        worksheet.Cell(2, 1).Value = $"From Date: {data.FromDate:yyyy-MM-dd}";
        worksheet.Cell(2, 2).Value = $"To Date: {data.ToDate:yyyy-MM-dd}";

        // Column headers
        int row = 4;
        worksheet.Cell(row, 1).Value = "GRN Number";
        worksheet.Cell(row, 2).Value = "Purchase Date";
        worksheet.Cell(row, 3).Value = "Supplier Name";
        worksheet.Cell(row, 4).Value = "Supplier GSTIN";
        worksheet.Cell(row, 5).Value = "Invoice Number";
        worksheet.Cell(row, 6).Value = "Taxable Value";
        worksheet.Cell(row, 7).Value = "CGST";
        worksheet.Cell(row, 8).Value = "SGST";
        worksheet.Cell(row, 9).Value = "IGST";
        worksheet.Cell(row, 10).Value = "Total Tax";
        worksheet.Cell(row, 11).Value = "Total Amount";

        row++;
        foreach (var purchase in data.Purchases)
        {
            worksheet.Cell(row, 1).Value = purchase.GRNNumber;
            worksheet.Cell(row, 2).Value = purchase.PurchaseDate;
            worksheet.Cell(row, 3).Value = purchase.SupplierName;
            worksheet.Cell(row, 4).Value = purchase.SupplierGSTIN ?? "";
            worksheet.Cell(row, 5).Value = purchase.InvoiceNumber ?? "";
            worksheet.Cell(row, 6).Value = purchase.TaxableValue;
            worksheet.Cell(row, 7).Value = purchase.CGST;
            worksheet.Cell(row, 8).Value = purchase.SGST;
            worksheet.Cell(row, 9).Value = purchase.IGST;
            worksheet.Cell(row, 10).Value = purchase.TotalTax;
            worksheet.Cell(row, 11).Value = purchase.TotalAmount;
            row++;
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}

