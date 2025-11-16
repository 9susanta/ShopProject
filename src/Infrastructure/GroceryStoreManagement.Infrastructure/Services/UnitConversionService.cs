using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Infrastructure.Services;

public class UnitConversionService : IUnitConversionService
{
    // Conversion factors to base units
    private static readonly Dictionary<UnitType, decimal> BaseUnitFactors = new()
    {
        { UnitType.Kilogram, 1000m },      // 1 kg = 1000 g
        { UnitType.Gram, 1m },            // Base unit for weight
        { UnitType.Litre, 1000m },        // 1 L = 1000 ml
        { UnitType.Millilitre, 1m },      // Base unit for volume
        { UnitType.Piece, 1m },           // Base unit for count
        { UnitType.Pack, 1m },            // No standard conversion
        { UnitType.Dozen, 12m }           // 1 dozen = 12 pieces
    };

    public decimal Convert(decimal quantity, UnitType fromUnit, UnitType toUnit)
    {
        if (fromUnit == toUnit)
            return quantity;

        if (!CanConvert(fromUnit, toUnit))
            throw new InvalidOperationException($"Cannot convert from {fromUnit} to {toUnit}");

        // Convert to base unit first
        var baseQuantity = quantity * BaseUnitFactors[fromUnit];

        // Convert from base unit to target unit
        return baseQuantity / BaseUnitFactors[toUnit];
    }

    public bool CanConvert(UnitType fromUnit, UnitType toUnit)
    {
        // Can only convert within same category
        var fromCategory = GetUnitCategory(fromUnit);
        var toCategory = GetUnitCategory(toUnit);

        return fromCategory == toCategory;
    }

    private string GetUnitCategory(UnitType unitType)
    {
        return unitType switch
        {
            UnitType.Kilogram or UnitType.Gram => "Weight",
            UnitType.Litre or UnitType.Millilitre => "Volume",
            UnitType.Piece or UnitType.Pack or UnitType.Dozen => "Count",
            _ => "Unknown"
        };
    }
}

