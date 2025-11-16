using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Domain.Entities;

public class Customer : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty; // Unique identifier
    public string? Email { get; private set; }
    public string? Address { get; private set; }
    public string? City { get; private set; }
    public string? Pincode { get; private set; }
    public int LoyaltyPoints { get; private set; } = 0;
    public decimal PayLaterBalance { get; private set; } = 0;
    public decimal PayLaterLimit { get; private set; } = 2000; // Default ₹2000
    public bool IsPayLaterEnabled { get; private set; } = false;
    public PaymentMethod? PreferredPaymentMethod { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Navigation properties
    public virtual ICollection<Sale> Sales { get; private set; } = new List<Sale>();
    public virtual ICollection<LoyaltyTransaction> LoyaltyTransactions { get; private set; } = new List<LoyaltyTransaction>();
    public virtual ICollection<PayLaterLedger> PayLaterLedgers { get; private set; } = new List<PayLaterLedger>();

    private Customer() { } // EF Core

    public Customer(string name, string phone, string? email = null, string? address = null, string? city = null, string? pincode = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Customer name cannot be null or empty", nameof(name));

        if (string.IsNullOrWhiteSpace(phone))
            throw new ArgumentException("Phone number is required", nameof(phone));

        // Basic validation for Indian phone numbers (10 digits)
        var cleanedPhone = phone.Replace(" ", "").Replace("-", "").Replace("+", "");
        if (cleanedPhone.Length != 10 || !cleanedPhone.All(char.IsDigit))
            throw new ArgumentException("Phone number must be 10 digits", nameof(phone));

        Name = name;
        Phone = cleanedPhone;
        Email = email;
        Address = address;
        City = city;
        Pincode = pincode;
    }

    public void Update(string name, string? email = null, string? address = null, string? city = null, string? pincode = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Customer name cannot be null or empty", nameof(name));

        Name = name;
        Email = email;
        Address = address;
        City = city;
        Pincode = pincode;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddLoyaltyPoints(int points)
    {
        if (points < 0)
            throw new ArgumentException("Points cannot be negative", nameof(points));

        LoyaltyPoints += points;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RedeemLoyaltyPoints(int points)
    {
        if (points < 0)
            throw new ArgumentException("Points cannot be negative", nameof(points));

        if (LoyaltyPoints < points)
            throw new InvalidOperationException("Insufficient loyalty points");

        LoyaltyPoints -= points;
        UpdatedAt = DateTime.UtcNow;
    }

    public void EnablePayLater(decimal limit = 2000)
    {
        IsPayLaterEnabled = true;
        PayLaterLimit = limit;
        UpdatedAt = DateTime.UtcNow;
    }

    public void DisablePayLater()
    {
        IsPayLaterEnabled = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddPayLaterBalance(decimal amount)
    {
        if (amount < 0)
            throw new ArgumentException("Amount cannot be negative", nameof(amount));

        if (PayLaterBalance + amount > PayLaterLimit)
            throw new InvalidOperationException($"Pay later limit exceeded. Limit: {PayLaterLimit}, Current: {PayLaterBalance}, Requested: {amount}");

        PayLaterBalance += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ReducePayLaterBalance(decimal amount)
    {
        if (amount < 0)
            throw new ArgumentException("Amount cannot be negative", nameof(amount));

        if (PayLaterBalance < amount)
            throw new InvalidOperationException($"Insufficient pay later balance. Current: {PayLaterBalance}, Requested: {amount}");

        PayLaterBalance -= amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPreferredPaymentMethod(PaymentMethod method)
    {
        PreferredPaymentMethod = method;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }
}

