using GroceryStoreManagement.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GroceryStoreManagement.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly string _basePath;
    private readonly ILogger<FileStorageService> _logger;

    public FileStorageService(IConfiguration configuration, ILogger<FileStorageService> logger)
    {
        _basePath = configuration["FileStorage:BasePath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        _logger = logger;

        // Ensure base directory exists
        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string folder, CancellationToken cancellationToken = default)
    {
        try
        {
            var folderPath = Path.Combine(_basePath, folder);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            var sanitizedFileName = SanitizeFileName(fileName);
            var uniqueFileName = $"{Guid.NewGuid()}_{sanitizedFileName}";
            var filePath = Path.Combine(folderPath, uniqueFileName);

            using (var fileStreamWriter = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(fileStreamWriter, cancellationToken);
            }

            var relativePath = Path.Combine(folder, uniqueFileName).Replace("\\", "/");
            _logger.LogInformation("File saved: {FilePath}", relativePath);

            return relativePath;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving file: {FileName}", fileName);
            throw;
        }
    }

    public async Task<Stream?> GetFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullPath = Path.Combine(_basePath, filePath);
            if (!File.Exists(fullPath))
            {
                _logger.LogWarning("File not found: {FilePath}", filePath);
                return null;
            }

            return new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading file: {FilePath}", filePath);
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullPath = Path.Combine(_basePath, filePath);
            if (!File.Exists(fullPath))
            {
                return false;
            }

            File.Delete(fullPath);
            _logger.LogInformation("File deleted: {FilePath}", filePath);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file: {FilePath}", filePath);
            return false;
        }
    }

    public string GetFileUrl(string filePath)
    {
        // Return relative URL - API will serve files via controller
        return $"/api/files/{filePath}";
    }

    private string SanitizeFileName(string fileName)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        return string.Join("_", fileName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));
    }
}
