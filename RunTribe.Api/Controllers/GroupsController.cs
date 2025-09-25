using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RunTribe.Api.DbContext;
using RunTribe.Api.Models;
using System.Security.Claims;

namespace RunTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GroupsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public GroupsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/groups
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetGroups()
    {
        // Get current user email from query parameter
        var userEmail = Request.Query["userEmail"].ToString();
        Guid? currentUserId = null;
        
        if (!string.IsNullOrEmpty(userEmail))
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user != null)
            {
                currentUserId = user.Id;
            }
        }

        var groups = await _context.Groups
            .Include(g => g.Owner)
            .Include(g => g.Members)
            .Select(g => new
            {
                g.Id,
                g.Name,
                g.Description,
                g.Location,
                g.ImageUrl,
                g.CreatedAt,
                Owner = new
                {
                    g.Owner.Id,
                    g.Owner.Name,
                    g.Owner.Email
                },
                MemberCount = g.Members.Count,
                IsJoined = currentUserId.HasValue && g.Members.Any(m => m.UserId == currentUserId.Value),
                IsOwner = currentUserId.HasValue && g.OwnerId == currentUserId.Value
            })
            .ToListAsync();

        return Ok(groups);
    }

    // GET: api/groups/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetGroup(Guid id)
    {
        // Get current user ID from query parameter
        var userEmail = Request.Query["userEmail"].ToString();
        Guid? currentUserId = null;
        
        if (!string.IsNullOrEmpty(userEmail))
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user != null)
            {
                currentUserId = user.Id;
            }
        }

        var group = await _context.Groups
            .Include(g => g.Owner)
            .Include(g => g.Members)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (group == null)
        {
            return NotFound();
        }

        var result = new
        {
            group.Id,
            group.Name,
            group.Description,
            group.Location,
            group.ImageUrl,
            group.CreatedAt,
            Owner = new
            {
                group.Owner.Id,
                group.Owner.Name,
                group.Owner.Email
            },
            Members = group.Members.Select(m => new
            {
                m.User.Id,
                m.User.Name,
                m.User.Email,
                m.JoinedAt
            }).ToList(),
            IsJoined = currentUserId.HasValue && group.Members.Any(m => m.UserId == currentUserId.Value),
            IsOwner = currentUserId.HasValue && group.OwnerId == currentUserId.Value
        };

        return Ok(result);
    }

    // POST: api/groups
    [HttpPost]
    public async Task<ActionResult<Group>> CreateGroup([FromBody] CreateGroupRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // For now, we'll use a query parameter to identify the user
        // In a real app, you might want to implement a different auth strategy
        var userEmail = Request.Query["userEmail"].ToString();
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return Unauthorized("User not found");
        }

        var userId = user.Id;

        var group = new Group
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Location = request.Location,
            ImageUrl = request.ImageUrl,
            OwnerId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Groups.Add(group);

        // Add the creator as the first member
        var groupMember = new GroupMember
        {
            Id = Guid.NewGuid(),
            GroupId = group.Id,
            UserId = userId,
            JoinedAt = DateTime.UtcNow
        };

        _context.GroupMembers.Add(groupMember);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            // Log the exception details for debugging
            Console.WriteLine($"Database error creating group: {ex.Message}");
            return BadRequest("Unable to create group. Please try again.");
        }
        catch (Exception ex)
        {
            // Log any other unexpected errors
            Console.WriteLine($"Unexpected error creating group: {ex.Message}");
            return StatusCode(500, "An unexpected error occurred while creating the group.");
        }

        // Return a DTO to avoid circular reference issues
        var result = new
        {
            group.Id,
            group.Name,
            group.Description,
            group.Location,
            group.CreatedAt,
            Owner = new
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email
            }
        };

        return Ok(result);
    }

    // POST: api/groups/{id}/join
    [HttpPost("{id}/join")]
    public async Task<IActionResult> JoinGroup(Guid id)
    {
        var userEmail = Request.Query["userEmail"].ToString();
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return Unauthorized("User not found");
        }

        var userId = user.Id;

        var group = await _context.Groups.FindAsync(id);
        if (group == null)
        {
            return NotFound("Group not found");
        }

        // Check if user is already a member
        var existingMember = await _context.GroupMembers
            .FirstOrDefaultAsync(gm => gm.GroupId == id && gm.UserId == userId);

        if (existingMember != null)
        {
            return BadRequest("User is already a member of this group");
        }

        var groupMember = new GroupMember
        {
            Id = Guid.NewGuid(),
            GroupId = id,
            UserId = userId,
            JoinedAt = DateTime.UtcNow
        };

        _context.GroupMembers.Add(groupMember);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Successfully joined group" });
    }

    // DELETE: api/groups/{id}/leave
    [HttpDelete("{id}/leave")]
    public async Task<IActionResult> LeaveGroup(Guid id)
    {
        var userEmail = Request.Query["userEmail"].ToString();
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return Unauthorized("User not found");
        }

        var userId = user.Id;

        var groupMember = await _context.GroupMembers
            .FirstOrDefaultAsync(gm => gm.GroupId == id && gm.UserId == userId);

        if (groupMember == null)
        {
            return BadRequest("User is not a member of this group");
        }

        // Don't allow the owner to leave their own group
        var group = await _context.Groups.FindAsync(id);
        if (group?.OwnerId == userId)
        {
            return BadRequest("Group owner cannot leave their own group");
        }

        _context.GroupMembers.Remove(groupMember);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Successfully left group" });
    }

    // PUT: api/groups/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGroup(Guid id, [FromBody] UpdateGroupRequest request)
    {
        var userEmail = Request.Query["userEmail"].ToString();
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return Unauthorized("User not found");
        }

        var userId = user.Id;

        var group = await _context.Groups.FindAsync(id);
        if (group == null)
        {
            return NotFound("Group not found");
        }

        // Only the group owner can edit the group
        if (group.OwnerId != userId)
        {
            return StatusCode(403, "Only the group owner can edit this group");
        }

        // Update the group
        group.Name = request.Name;
        group.Description = request.Description;
        group.Location = request.Location;
        group.ImageUrl = request.ImageUrl;

        try
        {
            await _context.SaveChangesAsync();
            
            // Return a DTO to avoid circular reference issues
            var result = new
            {
                group.Id,
                group.Name,
                group.Description,
                group.Location,
                group.ImageUrl,
                group.CreatedAt,
                Owner = new
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email
                }
            };
            
            return Ok(result);
        }
        catch (DbUpdateException)
        {
            return BadRequest("Unable to update group. Please try again.");
        }
    }

    // DELETE: api/groups/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGroup(Guid id)
    {
        var userEmail = Request.Query["userEmail"].ToString();
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return Unauthorized("User not found");
        }

        var userId = user.Id;

        var group = await _context.Groups
            .Include(g => g.Members)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (group == null)
        {
            return NotFound("Group not found");
        }

        // Only the group owner can delete the group
        if (group.OwnerId != userId)
        {
            return StatusCode(403, "Only the group owner can delete this group");
        }

        // Remove all group members first
        _context.GroupMembers.RemoveRange(group.Members);
        
        // Remove the group
        _context.Groups.Remove(group);
        
        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { message = "Group deleted successfully" });
        }
        catch (DbUpdateException)
        {
            return BadRequest("Unable to delete group. Please try again.");
        }
    }
}

public class CreateGroupRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public string? ImageUrl { get; set; }
}

public class UpdateGroupRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public string? ImageUrl { get; set; }
}
