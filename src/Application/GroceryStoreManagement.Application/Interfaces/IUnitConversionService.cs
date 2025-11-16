using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Interfaces;

public interface IUnitConversionService
{
    decimal Convert(decimal quantity, UnitType fromUnit, UnitType toUnit);
    bool CanConvert(UnitType fromUnit, UnitType toUnit);
}

