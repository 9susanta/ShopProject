using FluentValidation;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Entities;
using GroceryStoreManagement.Infrastructure.EventBus;
using GroceryStoreManagement.Infrastructure.Persistence;
using GroceryStoreManagement.Infrastructure.Repositories;
using GroceryStoreManagement.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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
        services.AddScoped<IUnitConversionService, UnitConversionService>();
        // NotificationService is registered separately in NotificationServiceRegistration to avoid circular dependency
        
        // Security Services
        services.AddSingleton<IRateLimitService, RateLimitService>();
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IEncryptionService, EncryptionService>();
        
        // Password hasher with Argon2/PBKDF2 support (replaces legacy PasswordHasher)
        services.AddScoped<IPasswordHasher, PasswordHasherService>();
        
        // Legacy JWT token service (for backward compatibility with existing code)
        services.AddScoped<IJwtTokenService, JwtTokenService>();

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
        services.AddHostedService<GroceryStoreManagement.Infrastructure.BackgroundServices.ExpiryScannerService>();
        services.AddHostedService<GroceryStoreManagement.Infrastructure.BackgroundServices.OutboxPublisher>();

        // Add JWT Authentication
        var jwtSecretKey = configuration["JwtSettings:SecretKey"] 
            ?? throw new InvalidOperationException("JWT SecretKey is not configured");
        var jwtIssuer = configuration["JwtSettings:Issuer"] ?? "GroceryStoreManagement";
        var jwtAudience = configuration["JwtSettings:Audience"] ?? "GroceryStoreManagement";

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,
                ValidateAudience = true,
                ValidAudience = jwtAudience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin", "SuperAdmin"));
            options.AddPolicy("SuperAdminOnly", policy => policy.RequireRole("SuperAdmin"));
        });

        return services;
    }

    public static async Task SeedDatabaseAsync(this IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        try
        {
            await context.Database.MigrateAsync();
            await SeedData.SeedAsync(context, scope.ServiceProvider);
        }
        catch (Exception ex)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while seeding the database");
            // Don't throw - allow app to start even if seeding fails
        }
    }
}

