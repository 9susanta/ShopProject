using MediatR;
using GroceryStoreManagement.Application.DTOs;

namespace GroceryStoreManagement.Application.Queries.Inventory;

public class GetReorderSuggestionsQuery : IRequest<List<ReorderSuggestionDto>>
{
    public bool OnlyBelowReorderPoint { get; set; } = true;
}

