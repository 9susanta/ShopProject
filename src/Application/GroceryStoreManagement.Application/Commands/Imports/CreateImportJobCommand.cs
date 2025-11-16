using MediatR;
using GroceryStoreManagement.Application.DTOs;
using GroceryStoreManagement.Domain.Enums;

namespace GroceryStoreManagement.Application.Commands.Imports;

public class CreateImportJobCommand : IRequest<ImportJobDto>
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty; // Excel, JSON
    public string? MappingJson { get; set; }
    public bool CreateMissingCategories { get; set; } = false;
    public UpdateExistingBy UpdateExistingBy { get; set; } = UpdateExistingBy.None;
    public bool GenerateBarcodeIfMissing { get; set; } = false;
}

