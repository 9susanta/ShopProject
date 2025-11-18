namespace GroceryStoreManagement.Application.DTOs;

public class GSTSummaryReportDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalSales { get; set; }
    public decimal TotalGST { get; set; }
    public decimal TotalCGST { get; set; }
    public decimal TotalSGST { get; set; }
    public List<GSTSlabSummaryDto> SlabSummaries { get; set; } = new();
}

public class GSTSlabSummaryDto
{
    public decimal Rate { get; set; }
    public decimal TaxableAmount { get; set; }
    public decimal CGSTAmount { get; set; }
    public decimal SGSTAmount { get; set; }
    public decimal TotalGSTAmount { get; set; }
    public int TransactionCount { get; set; }
}

