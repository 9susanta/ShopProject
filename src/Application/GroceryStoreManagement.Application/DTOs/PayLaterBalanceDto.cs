namespace GroceryStoreManagement.Application.DTOs;

public class PayLaterBalanceDto
{
    public Guid CustomerId { get; set; }
    public decimal Balance { get; set; }
    public decimal Limit { get; set; }
    public bool IsEnabled { get; set; }
    public decimal AvailableCredit { get; set; }
}

