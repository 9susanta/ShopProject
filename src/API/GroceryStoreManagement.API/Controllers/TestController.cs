using GroceryStoreManagement.API.Scripts;
using GroceryStoreManagement.Application.Interfaces;
using GroceryStoreManagement.Domain.Enums;
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

    /// <summary>
    /// Update test user passwords to use new 10k iterations (simpler than full reset)
    /// </summary>
    [HttpPost("update-passwords")]
    public async Task<IActionResult> UpdatePasswords()
    {
        try
        {
            var passwordHasher = _serviceProvider.GetRequiredService<IPasswordHasher>();
            var updatedCount = 0;

            // Update SuperAdmin password
            var superAdmin = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == "superadmin@test.com" || u.Role == UserRole.SuperAdmin);
            if (superAdmin != null)
            {
                var superAdminResult = passwordHasher.HashPassword("SuperAdmin123!");
                superAdmin.ChangePassword(superAdminResult.Hash);
                superAdmin.SetPasswordMetadata(superAdminResult.Algorithm, superAdminResult.Salt, superAdminResult.Iterations);
                updatedCount++;
            }

            // Update Admin password
            var admin = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == "admin@test.com" || u.Role == UserRole.Admin);
            if (admin != null)
            {
                var adminResult = passwordHasher.HashPassword("Admin123!");
                admin.ChangePassword(adminResult.Hash);
                admin.SetPasswordMetadata(adminResult.Algorithm, adminResult.Salt, adminResult.Iterations);
                updatedCount++;
            }

            // Update Staff password
            var staff = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == "staff@test.com" || u.Role == UserRole.Staff);
            if (staff != null)
            {
                var staffResult = passwordHasher.HashPassword("Staff123!");
                staff.ChangePassword(staffResult.Hash);
                staff.SetPasswordMetadata(staffResult.Algorithm, staffResult.Salt, staffResult.Iterations);
                updatedCount++;
            }

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = $"Passwords updated successfully for {updatedCount} user(s).", 
                updatedCount = updatedCount 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating passwords", error = ex.Message });
        }
    }
}

