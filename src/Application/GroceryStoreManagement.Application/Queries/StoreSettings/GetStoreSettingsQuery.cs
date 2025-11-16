using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.StoreSettings;

public class GetStoreSettingsQuery : IRequest<StoreSettingsDto?>
{
}

