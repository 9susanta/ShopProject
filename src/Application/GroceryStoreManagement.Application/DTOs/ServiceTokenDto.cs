using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.DTOs;

public class ServiceTokenDto
{
    public Guid Id { get; set; }
    public int TokenNumber { get; set; }
    public Guid? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public TokenStatus Status { get; set; }
    public TokenType Type { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CalledAt { get; set; }
    public DateTime? ServedAt { get; set; }
    public Guid? ServedByUserId { get; set; }
    public string? ServedByUserName { get; set; }
    public string? Notes { get; set; }
    public int Priority { get; set; }
    public int? WaitTimeMinutes { get; set; }
}

public class ServiceTokenListResponseDto
{
    public List<ServiceTokenDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int WaitingCount { get; set; }
    public int CalledCount { get; set; }
    public ServiceTokenDto? CurrentToken { get; set; }
}

