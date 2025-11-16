using FluentValidation;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Infrastructure.EventBus;
using GroceryStoreManagement.Infrastructure.Persistence;
using GroceryStoreManagement.Infrastructure.Repositories;
using GroceryStoreManagement.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace GroceryStoreManagement.API.DI;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Add MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Application.Commands.Products.CreateProductCommand).Assembly));

        // Add FluentValidation
        services.AddValidatorsFromAssembly(typeof(Application.Validation.CreateProductCommandValidator).Assembly);

        // Add AutoMapper
        services.AddAutoMapper(typeof(API.Mappings.MappingProfile));

        return services;
    }

    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Add Memory Cache
        services.AddMemoryCache(options =>
        {
            options.SizeLimit = configuration.GetValue<long?>("Cache:SizeLimit") ?? 1024; // Default 1024 entries
        });

        // Add Cache Service
        services.AddSingleton<ICacheService, CacheService>();

        // Add DbContext
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Server=(localdb)\\mssqllocaldb;Database=GroceryStoreManagement;Trusted_Connection=True;MultipleActiveResultSets=true";

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString));

        // Add Repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Add Services
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddScoped<IVoiceToTextService, VoiceToTextService>();

        // Add Import Services
        services.AddScoped<IImportService, ImportService>();
        services.AddScoped<IExcelParserService, ExcelParserService>();
        services.AddScoped<IJsonParserService, JsonParserService>();
        services.AddScoped<IErrorReportService, ErrorReportService>();
        services.AddScoped<IMasterDataCache, MasterDataCacheService>();

        // Add Event Bus
        services.AddSingleton<IEventBus, InMemoryEventBus>();

        // Add Background Services
        services.AddHostedService<OutboxEventPublisher>();
        services.AddHostedService<GroceryStoreManagement.Infrastructure.BackgroundServices.ImportBackgroundWorker>();

        return services;
    }

    public static async Task SeedDatabaseAsync(this IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        try
        {
            await context.Database.MigrateAsync();
            await SeedData.SeedAsync(context);
        }
        catch (Exception ex)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while seeding the database");
        }
    }
}

