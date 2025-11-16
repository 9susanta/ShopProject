using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Domain.Entities;

public class Sale : BaseEntity
{
    public string InvoiceNumber { get; private set; } = string.Empty;
    public Guid? CustomerId { get; private set; }
    public string? CustomerPhone { get; private set; } // For guest customers
    public SaleStatus Status { get; private set; } = SaleStatus.Draft;
    public DateTime SaleDate { get; private set; } = DateTime.UtcNow;
    public decimal SubTotal { get; private set; }
    public decimal CGSTAmount { get; private set; } // Central GST
    public decimal SGSTAmount { get; private set; } // State GST
    public decimal TotalGSTAmount => CGSTAmount + SGSTAmount;
    public decimal DiscountAmount { get; private set; }
    public decimal PackingCharges { get; private set; } = 0;
    public decimal HomeDeliveryCharges { get; private set; } = 0;
    public decimal LoyaltyPointsRedeemed { get; private set; } = 0;
    public decimal TotalAmount { get; private set; }
    public PaymentMethod PaymentMethod { get; private set; } = PaymentMethod.Cash;
    public decimal CashAmount { get; private set; } = 0;
    public decimal UPIAmount { get; private set; } = 0;
    public decimal CardAmount { get; private set; } = 0;
    public decimal PayLaterAmount { get; private set; } = 0;
    public bool IsHomeDelivery { get; private set; } = false;
    public string? DeliveryAddress { get; private set; }
    public int? TokenNumber { get; private set; } // For queue management

    // Navigation properties
    public virtual Customer? Customer { get; private set; }
    public virtual ICollection<SaleItem> Items { get; private set; } = new List<SaleItem>();
    public virtual Invoice? Invoice { get; private set; }

    private Sale() { } // EF Core

    public Sale(string invoiceNumber, Guid? customerId = null, string? customerPhone = null, decimal discountAmount = 0)
    {
        if (string.IsNullOrWhiteSpace(invoiceNumber))
            throw new ArgumentException("Invoice number cannot be null or empty", nameof(invoiceNumber));

        InvoiceNumber = invoiceNumber;
        CustomerId = customerId;
        CustomerPhone = customerPhone;
        DiscountAmount = discountAmount;
        Status = SaleStatus.Draft;
    }

    public void AddItem(Guid productId, int quantity, decimal unitPrice)
    {
        if (Status != SaleStatus.Draft)
            throw new InvalidOperationException("Cannot add items to a non-draft sale");

        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (unitPrice < 0)
            throw new ArgumentException("Unit price cannot be negative", nameof(unitPrice));

        var item = new SaleItem(Id, productId, quantity, unitPrice);
        Items.Add(item);
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveItem(Guid itemId)
    {
        if (Status != SaleStatus.Draft)
            throw new InvalidOperationException("Cannot remove items from a non-draft sale");

        var item = Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new InvalidOperationException($"Item with id {itemId} not found");

        Items.Remove(item);
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        if (Status != SaleStatus.Draft)
            throw new InvalidOperationException("Only draft sales can be completed");

        if (!Items.Any())
            throw new InvalidOperationException("Cannot complete a sale without items");

        Status = SaleStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == SaleStatus.Completed)
            throw new InvalidOperationException("Cannot cancel a completed sale");

        Status = SaleStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ApplyDiscount(decimal discountAmount)
    {
        if (discountAmount < 0)
            throw new ArgumentException("Discount amount cannot be negative", nameof(discountAmount));

        DiscountAmount = discountAmount;
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPackingCharges(decimal charges)
    {
        if (charges < 0)
            throw new ArgumentException("Packing charges cannot be negative", nameof(charges));

        PackingCharges = charges;
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetHomeDelivery(bool isDelivery, decimal charges = 0, string? address = null)
    {
        IsHomeDelivery = isDelivery;
        HomeDeliveryCharges = isDelivery ? charges : 0;
        DeliveryAddress = isDelivery ? address : null;
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;
    }

    public void RedeemLoyaltyPoints(decimal pointsValue)
    {
        if (pointsValue < 0)
            throw new ArgumentException("Loyalty points value cannot be negative", nameof(pointsValue));

        LoyaltyPointsRedeemed = pointsValue;
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPaymentMethod(PaymentMethod method, decimal cashAmount = 0, decimal upiAmount = 0, 
        decimal cardAmount = 0, decimal payLaterAmount = 0)
    {
        PaymentMethod = method;
        CashAmount = cashAmount;
        UPIAmount = upiAmount;
        CardAmount = cardAmount;
        PayLaterAmount = payLaterAmount;

        var totalPayment = cashAmount + upiAmount + cardAmount + payLaterAmount;
        if (Math.Abs(totalPayment - TotalAmount) > 0.01m)
            throw new InvalidOperationException($"Payment amount mismatch. Total: {TotalAmount}, Payment: {totalPayment}");

        UpdatedAt = DateTime.UtcNow;
    }

    public void SetTokenNumber(int tokenNumber)
    {
        TokenNumber = tokenNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    private void RecalculateTotals()
    {
        SubTotal = Items.Sum(i => i.TotalPrice);
        
        // Calculate GST from items (each item has its own tax slab)
        CGSTAmount = Items.Sum(i => i.CGSTAmount);
        SGSTAmount = Items.Sum(i => i.SGSTAmount);
        
        TotalAmount = SubTotal + TotalGSTAmount - DiscountAmount - LoyaltyPointsRedeemed + PackingCharges + HomeDeliveryCharges;
    }
}

