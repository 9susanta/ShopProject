using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.Domain.Specifications;

public class ActiveProductsSpecification
{
    public static IQueryable<Product> Apply(IQueryable<Product> query)
    {
        return query.Where(p => p.IsActive);
    }
}

