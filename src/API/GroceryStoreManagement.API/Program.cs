using GroceryStoreManagement.API.DI;
using GroceryStoreManagement.API.Middlewares;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/grocery-store-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Ensure camelCase property names for JSON serialization (matches frontend expectations)
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = false;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Grocery Store Management API",
        Version = "v1",
        Description = "A production-ready event-driven Grocery Store Management System"
    });
});

// Add SignalR
builder.Services.AddSignalR();

// Add CORS
builder.Services.AddCors(options =>
{
    // Policy for API requests (no credentials needed)
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });

    // Policy for SignalR (requires credentials for auth)
    options.AddPolicy("AllowSignalR", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Required for SignalR with auth
    });
});

// Add Application and Infrastructure services
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddInfrastructureServices(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline
// Enable Swagger in all environments for easier testing
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Grocery Store Management API v1");
    c.RoutePrefix = "swagger"; // Set Swagger UI at the app's root
});

app.UseHttpsRedirection();

// CORS must be early in pipeline for preflight requests
// Use default policy for API, SignalR will override with RequireCors
app.UseCors("AllowAll");

// Security & Audit Middleware (order matters - audit first to capture all requests)
app.UseMiddleware<AuditMiddleware>();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseMiddleware<RateLimitMiddleware>();

// Add exception handling middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

// Add SignalR for import progress notifications with CORS policy
app.MapHub<GroceryStoreManagement.API.Hubs.ImportProgressHub>("/hubs/import-progress")
   .RequireCors("AllowSignalR");

app.MapControllers();

// Seed database
await app.Services.SeedDatabaseAsync();

app.Run();
