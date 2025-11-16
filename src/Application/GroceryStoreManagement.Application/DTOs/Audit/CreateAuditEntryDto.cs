namespace GroceryStoreManagement.Application.DTOs.Audit;

/// <summary>
/// DTO for creating audit entries
/// </summary>
public class CreateAuditEntryDto
{
    public string TableName { get; set; } = string.Empty;
    public string KeyValues { get; set; } = string.Empty;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string Operation { get; set; } = string.Empty;
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string? CorrelationId { get; set; }
    public string? RequestPath { get; set; }
    public string? ClientIp { get; set; }
    public string? Metadata { get; set; }
}

