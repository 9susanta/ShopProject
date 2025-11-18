using GroceryStoreManagement.API.Scripts;
using GroceryStoreManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/test")]
[AllowAnonymous] // Allow anonymous for testing - remove in production
public class TestController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IServiceProvider _serviceProvider;

    public TestController(ApplicationDbContext context, IServiceProvider serviceProvider)
    {
        _context = context;
        _serviceProvider = serviceProvider;
    }

    [HttpPost("clean-database")]
    public async Task<IActionResult> CleanDatabase()
    {
        try
        {
            await GroceryStoreManagement.API.Scripts.CleanDatabase.CleanAsync(_serviceProvider);
            return Ok(new { message = "Database cleaned successfully. Users preserved." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error cleaning database", error = ex.Message });
        }
    }

    [HttpPost("reset-seed")]
    public async Task<IActionResult> ResetSeed()
    {
        try
        {
            // Clean database first
            await GroceryStoreManagement.API.Scripts.CleanDatabase.CleanAsync(_serviceProvider);
            
            // Re-seed
            await SeedData.SeedAsync(_context, _serviceProvider);
            
            return Ok(new { message = "Database reset and seeded successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error resetting database", error = ex.Message });
        }
    }
}

