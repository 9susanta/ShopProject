using AutoMapper;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Domain.Entities;

namespace GroceryStoreManagement.API.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Product, ProductDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty));

        CreateMap<Category, CategoryDto>();
        CreateMap<Supplier, SupplierDto>();
        CreateMap<Customer, CustomerDto>();
        CreateMap<Domain.Entities.Inventory, InventoryDto>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : string.Empty))
            .ForMember(dest => dest.SKU, opt => opt.MapFrom(src => src.Product != null ? src.Product.SKU : string.Empty))
            .ForMember(dest => dest.IsLowStock, opt => opt.MapFrom(src => src.Product != null && src.IsLowStock(src.Product.LowStockThreshold)));
    }
}

