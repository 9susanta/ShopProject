namespace GroceryStoreManagement.Application.DTOs;

public class GSTR1ExportDto
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public List<GSTR1InvoiceDto> Invoices { get; set; } = new();
}

public class GSTR1InvoiceDto
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public string? CustomerGSTIN { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal TaxableValue { get; set; }
    public decimal CGST { get; set; }
    public decimal SGST { get; set; }
    public decimal IGST { get; set; }
    public decimal TotalTax { get; set; }
    public decimal TotalAmount { get; set; }
    public List<GSTR1ItemDto> Items { get; set; } = new();
}

public class GSTR1ItemDto
{
    public string ProductName { get; set; } = string.Empty;
    public string HSNCode { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxableValue { get; set; }
    public decimal TaxRate { get; set; }
    public decimal CGST { get; set; }
    public decimal SGST { get; set; }
    public decimal IGST { get; set; }
}

public class GSTR2ExportDto
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public List<GSTR2PurchaseDto> Purchases { get; set; } = new();
}

public class GSTR2PurchaseDto
{
    public string GRNNumber { get; set; } = string.Empty;
    public DateTime PurchaseDate { get; set; }
    public string? SupplierGSTIN { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? InvoiceNumber { get; set; }
    public decimal TaxableValue { get; set; }
    public decimal CGST { get; set; }
    public decimal SGST { get; set; }
    public decimal IGST { get; set; }
    public decimal TotalTax { get; set; }
    public decimal TotalAmount { get; set; }
    public List<GSTR2ItemDto> Items { get; set; } = new();
}

public class GSTR2ItemDto
{
    public string ProductName { get; set; } = string.Empty;
    public string HSNCode { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxableValue { get; set; }
    public decimal TaxRate { get; set; }
    public decimal CGST { get; set; }
    public decimal SGST { get; set; }
    public decimal IGST { get; set; }
}

