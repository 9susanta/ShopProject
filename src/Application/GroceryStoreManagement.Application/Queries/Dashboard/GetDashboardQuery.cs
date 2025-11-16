using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Dashboard;

public class GetDashboardQuery : IRequest<DashboardDto>
{
}

