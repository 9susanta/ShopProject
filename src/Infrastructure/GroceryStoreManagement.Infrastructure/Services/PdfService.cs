using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Application.Queries.Sales;
using MediatR;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Microsoft.Extensions.Logging;
using QuestPDFUnit = QuestPDF.Infrastructure.Unit;

namespace GroceryStoreManagement.Infrastructure.Services;

public class PdfService : IPdfService
{
    private readonly IMediator _mediator;
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<PdfService> _logger;

    public PdfService(
        IMediator mediator,
        IFileStorageService fileStorageService,
        ILogger<PdfService> logger)
    {
        _mediator = mediator;
        _fileStorageService = fileStorageService;
        _logger = logger;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<string> GenerateInvoicePdfAsync(Guid saleId, string invoiceNumber, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get sale details
            var query = new GetSaleByIdQuery { Id = saleId };
            var sale = await _mediator.Send(query, cancellationToken);

            if (sale == null)
                throw new InvalidOperationException($"Sale with ID {saleId} not found");

            // Generate PDF
            var pdfBytes = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, QuestPDFUnit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header()
                        .Row(row =>
                        {
                            row.RelativeColumn().Column(column =>
                            {
                                column.Item().Text("INVOICE").FontSize(20).Bold();
                                column.Item().Text($"Invoice #: {invoiceNumber}").FontSize(12);
                                column.Item().Text($"Date: {sale.SaleDate:dd MMM yyyy HH:mm}").FontSize(10);
                            });

                            row.ConstantColumn(100).AlignRight().Column(column =>
                            {
                                column.Item().Text("Grocery Store").FontSize(14).Bold();
                                column.Item().Text("Retail Invoice").FontSize(10);
                            });
                        });

                    page.Content()
                        .PaddingVertical(1, QuestPDFUnit.Centimetre)
                        .Column(column =>
                        {
                            // Customer Info
                            if (!string.IsNullOrEmpty(sale.CustomerName))
                            {
                                column.Item().PaddingBottom(0.5f, QuestPDFUnit.Centimetre).Column(c =>
                                {
                                    c.Item().Text("Bill To:").Bold();
                                    c.Item().Text(sale.CustomerName);
                                    if (!string.IsNullOrEmpty(sale.CustomerPhone))
                                        c.Item().Text($"Phone: {sale.CustomerPhone}");
                                });
                            }

                            // Items Table
                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(30);
                                    columns.RelativeColumn(3);
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(1);
                                });

                                // Header
                                table.Header(header =>
                                {
                                    header.Cell().Element(CellStyle).Text("#").Bold();
                                    header.Cell().Element(CellStyle).Text("Item").Bold();
                                    header.Cell().Element(CellStyle).AlignRight().Text("Qty").Bold();
                                    header.Cell().Element(CellStyle).AlignRight().Text("Price").Bold();
                                    header.Cell().Element(CellStyle).AlignRight().Text("Total").Bold();
                                });

                                // Items
                                int index = 1;
                                foreach (var item in sale.Items)
                                {
                                    table.Cell().Element(CellStyle).Text(index++.ToString());
                                    table.Cell().Element(CellStyle).Text(item.ProductName);
                                    table.Cell().Element(CellStyle).AlignRight().Text(item.Quantity.ToString());
                                    table.Cell().Element(CellStyle).AlignRight().Text($"₹{item.UnitPrice:F2}");
                                    table.Cell().Element(CellStyle).AlignRight().Text($"₹{item.TotalPrice:F2}");
                                }
                            });

                            // Summary
                            column.Item().PaddingTop(1, QuestPDFUnit.Centimetre).Column(summary =>
                            {
                                summary.Item().Row(row =>
                                {
                                    row.RelativeColumn();
                                    row.ConstantColumn(150).Column(col =>
                                    {
                                        col.Item().Row(r =>
                                        {
                                            r.RelativeColumn().Text("Subtotal:");
                                            r.ConstantColumn(80).AlignRight().Text($"₹{sale.SubTotal:F2}");
                                        });
                                        if (sale.DiscountAmount > 0)
                                        {
                                            col.Item().Row(r =>
                                            {
                                                r.RelativeColumn().Text("Discount:");
                                                r.ConstantColumn(80).AlignRight().Text($"-₹{sale.DiscountAmount:F2}");
                                            });
                                        }
                                        if (sale.TaxAmount > 0)
                                        {
                                            col.Item().Row(r =>
                                            {
                                                r.RelativeColumn().Text("Tax (GST):");
                                                r.ConstantColumn(80).AlignRight().Text($"₹{sale.TaxAmount:F2}");
                                            });
                                        }
                                        col.Item().PaddingTop(0.5f, QuestPDFUnit.Centimetre).Row(r =>
                                        {
                                            r.RelativeColumn().Text("Total:").Bold().FontSize(12);
                                            r.ConstantColumn(80).AlignRight().Text($"₹{sale.TotalAmount:F2}").Bold().FontSize(12);
                                        });
                                    });
                                });
                            });

                            // Payment Method
                            column.Item().PaddingTop(0.5f, QuestPDFUnit.Centimetre).Text($"Payment: {sale.PaymentMethod}").FontSize(9);
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text("Thank you for your business!")
                        .FontSize(9);
                });
            })
            .GeneratePdf();

            // Save PDF file
            var fileName = $"invoice_{invoiceNumber}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
            using var stream = new MemoryStream(pdfBytes);
            var filePath = await _fileStorageService.SaveFileAsync(stream, fileName, "invoices", cancellationToken);

            _logger.LogInformation("PDF invoice generated: {FilePath}", filePath);
            return filePath;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating PDF invoice for sale: {SaleId}", saleId);
            throw;
        }
    }

    private static IContainer CellStyle(IContainer container)
    {
        return container
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten2)
            .PaddingVertical(5)
            .PaddingHorizontal(5);
    }
}

