using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RunTribe.Api.DbContext;
using RunTribe.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace RunTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuthController(ApplicationDbContext context)
    {
        _context = context;
    }

    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        public string Name { get; set; } = string.Empty;
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return Unauthorized("Invalid email or password");
            }

            // Verify the password (plain text comparison for portfolio project)
            if (user.PasswordHash != request.Password)
            {
                return Unauthorized("Invalid email or password");
            }

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                name = user.Name
            });
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred during login");
        }
    }

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("User with this email already exists");
            }

            // Store password in plain text (for portfolio project only)
            // Create new user
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                Name = request.Name,
                PasswordHash = request.Password, // Store plain text password
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                name = user.Name
            });
        }
        catch (DbUpdateException dbEx)
        {
            // Log the actual error for debugging
            Console.WriteLine($"Registration DB error: {dbEx.Message}");
            if (dbEx.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {dbEx.InnerException.Message}");
                Console.WriteLine($"Inner stack trace: {dbEx.InnerException.StackTrace}");
                
                // Check for common database errors
                var innerMessage = dbEx.InnerException.Message.ToLowerInvariant();
                if (innerMessage.Contains("unique constraint") || innerMessage.Contains("duplicate key"))
                {
                    return BadRequest("A user with this email already exists");
                }
                if (innerMessage.Contains("foreign key") || innerMessage.Contains("constraint"))
                {
                    return StatusCode(500, "Database constraint violation. Please contact support.");
                }
                
                return StatusCode(500, $"Database error: {dbEx.InnerException.Message}");
            }
            return StatusCode(500, $"Database error: {dbEx.Message}");
        }
        catch (Exception ex)
        {
            // Log the actual error for debugging
            Console.WriteLine($"Registration error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                Console.WriteLine($"Inner stack trace: {ex.InnerException.StackTrace}");
                return StatusCode(500, $"An error occurred during registration: {ex.InnerException.Message}");
            }
            return StatusCode(500, $"An error occurred during registration: {ex.Message}");
        }
    }
}
