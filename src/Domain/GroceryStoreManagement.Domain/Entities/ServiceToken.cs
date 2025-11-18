using GroceryStoreManagement.Domain.Common;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Domain.Entities;

public class ServiceToken : BaseEntity
{
    public int TokenNumber { get; private set; }
    public Guid? CustomerId { get; private set; }
    public string? CustomerName { get; private set; }
    public string? CustomerPhone { get; private set; }
    public TokenStatus Status { get; private set; }
    public TokenType Type { get; private set; }
    public DateTime? CalledAt { get; private set; }
    public DateTime? ServedAt { get; private set; }
    public Guid? ServedByUserId { get; private set; }
    public string? Notes { get; private set; }
    public int Priority { get; private set; } // Higher number = higher priority

    // Navigation properties
    public Customer? Customer { get; private set; }
    public User? ServedBy { get; private set; }

    private ServiceToken() { } // For EF Core

    public ServiceToken(int tokenNumber, TokenType type, Guid? customerId = null, string? customerName = null, string? customerPhone = null, int priority = 0, string? notes = null)
    {
        TokenNumber = tokenNumber;
        Type = type;
        CustomerId = customerId;
        CustomerName = customerName;
        CustomerPhone = customerPhone;
        Status = TokenStatus.Waiting;
        Priority = priority;
        Notes = notes;
    }

    public void Call(Guid servedByUserId)
    {
        if (Status != TokenStatus.Waiting)
            throw new InvalidOperationException("Only waiting tokens can be called");

        Status = TokenStatus.Called;
        CalledAt = DateTime.UtcNow;
        ServedByUserId = servedByUserId;
    }

    public void Serve(Guid servedByUserId, string? notes = null)
    {
        if (Status != TokenStatus.Called && Status != TokenStatus.Waiting)
            throw new InvalidOperationException("Token must be called or waiting to be served");

        Status = TokenStatus.Served;
        ServedAt = DateTime.UtcNow;
        ServedByUserId = servedByUserId;
        Notes = notes;
    }

    public void Cancel(string? reason = null)
    {
        if (Status == TokenStatus.Served)
            throw new InvalidOperationException("Cannot cancel a served token");

        Status = TokenStatus.Cancelled;
        Notes = reason ?? Notes;
    }

    public void Skip()
    {
        if (Status != TokenStatus.Called)
            throw new InvalidOperationException("Only called tokens can be skipped");

        Status = TokenStatus.Waiting;
        CalledAt = null;
        ServedByUserId = null;
    }

    public void SetPriority(int priority)
    {
        Priority = priority;
    }
}

