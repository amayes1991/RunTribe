using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RunTribe.Api.DbContext;
using RunTribe.Api.Models;
using System.ComponentModel.DataAnnotations;
using BCrypt.Net;

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

            // Verify the password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
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
        catch (Exception ex)
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

            // Hash the password before storing
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create new user
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                Name = request.Name,
                PasswordHash = passwordHash,
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
        catch (Exception ex)
        {
            // Log the actual error for debugging
            Console.WriteLine($"Registration error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            return StatusCode(500, $"An error occurred during registration: {ex.Message}");
        }
    }
}
