using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RunTribe.Api.DbContext;
using RunTribe.Api.Models;

namespace RunTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/users/profile
    [HttpGet("profile")]
    public async Task<ActionResult<User>> GetUserProfile([FromQuery] string userEmail)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);

        if (user == null)
        {
            return NotFound("User not found");
        }

        return user;
    }

    // GET: api/users/stats
    [HttpGet("stats")]
    public async Task<ActionResult<UserStats>> GetUserStats([FromQuery] string userEmail)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return NotFound("User not found");
        }

        var stats = new UserStats
        {
            GroupsJoined = await _context.GroupMembers.CountAsync(gm => gm.UserId == user.Id),
            GroupsOwned = await _context.Groups.CountAsync(g => g.OwnerId == user.Id),
            TotalRuns = await _context.GroupRuns.CountAsync(gr => gr.AuthorId == user.Id)
        };

        return stats;
    }

    // PUT: api/users/profile
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateUserProfile([FromQuery] string userEmail, [FromBody] UpdateProfileRequest request)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return NotFound("User not found");
        }

        // Update user profile
        user.Name = request.Name;
        user.Email = request.Email;
        user.ImageUrl = request.ImageUrl;

        try
        {
            await _context.SaveChangesAsync();
            
            var result = new
            {
                user.Id,
                user.Name,
                user.Email,
                user.ImageUrl,
                user.CreatedAt
            };
            
            return Ok(result);
        }
        catch (DbUpdateException)
        {
            return BadRequest("Unable to update profile. Please try again.");
        }
    }

    // GET: api/users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await _context.Users.ToListAsync();
    }

    // GET: api/users/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound();
        }

        return user;
    }

    // POST: api/users
    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
    {
        if (await _context.Users.AnyAsync(u => u.Email == user.Email))
        {
            return BadRequest("User with this email already exists.");
        }

        user.Id = Guid.NewGuid();
        user.CreatedAt = DateTime.UtcNow;

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    // PUT: api/users/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, User user)
    {
        if (id != user.Id)
        {
            return BadRequest();
        }

        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser == null)
        {
            return NotFound();
        }

        existingUser.Name = user.Name;
        existingUser.ImageUrl = user.ImageUrl;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/users/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/users/change-password
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.UserEmail) || 
            string.IsNullOrEmpty(request.CurrentPassword) || 
            string.IsNullOrEmpty(request.NewPassword))
        {
            return BadRequest("All fields are required");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.UserEmail);
        if (user == null)
        {
            return NotFound("User not found");
        }

        // Validate new password strength
        if (request.NewPassword.Length < 6)
        {
            return BadRequest("New password must be at least 6 characters long");
        }

        // For now, since we don't have password storage in the User model,
        // we'll just validate the request and return success
        // In a real implementation, you would:
        // 1. Verify the current password against your auth system
        // 2. Update the password in your auth system
        
        return Ok(new { message = "Password change request validated successfully. Note: Password storage not implemented in current User model." });
    }

    private bool UserExists(Guid id)
    {
        return _context.Users.Any(e => e.Id == id);
    }
}

public class UpdateProfileRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}

public class UserStats
{
    public int GroupsJoined { get; set; }
    public int GroupsOwned { get; set; }
    public int TotalRuns { get; set; }
}

public class ChangePasswordRequest
{
    public string UserEmail { get; set; } = string.Empty;
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
} 