using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RunTribe.Api.DbContext;
using RunTribe.Api.DTOs;
using RunTribe.Api.Models;
using Microsoft.AspNetCore.SignalR;
using RunTribe.Api.Hubs;

namespace RunTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<ChatHub> _hubContext;

    public MessagesController(ApplicationDbContext context, IHubContext<ChatHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    // GET: api/messages/group/{groupId}
    [HttpGet("group/{groupId}")]
    public async Task<ActionResult<IEnumerable<MessageResponse>>> GetGroupMessages(Guid groupId, [FromQuery] string userEmail)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        // Check if user is a member of the group
        var isMember = await _context.GroupMembers
            .AnyAsync(gm => gm.GroupId == groupId && gm.User.Email == userEmail);

        if (!isMember)
        {
            return Forbid("You must be a member of this group to view messages");
        }

        var messages = await _context.Messages
            .Where(m => m.GroupId == groupId)
            .Include(m => m.User)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new MessageResponse
            {
                Id = m.Id,
                Content = m.Content,
                CreatedAt = m.CreatedAt,
                IsEdited = m.IsEdited,
                EditedAt = m.EditedAt,
                User = new UserResponse
                {
                    Id = m.User.Id,
                    Name = m.User.Name ?? m.User.Email,
                    Email = m.User.Email,
                    ImageUrl = m.User.ImageUrl
                }
            })
            .ToListAsync();

        return Ok(messages);
    }

    // POST: api/messages/group/{groupId}
    [HttpPost("group/{groupId}")]
    public async Task<ActionResult<MessageResponse>> CreateMessage(Guid groupId, [FromBody] CreateMessageRequest request, [FromQuery] string userEmail)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest("Message content is required");
        }

        // Check if user is a member of the group
        var user = await _context.Users
            .Include(u => u.GroupMemberships)
            .FirstOrDefaultAsync(u => u.Email == userEmail);

        if (user == null)
        {
            return NotFound("User not found");
        }

        var isMember = user.GroupMemberships.Any(gm => gm.GroupId == groupId);
        if (!isMember)
        {
            return Forbid("You must be a member of this group to send messages");
        }

        var message = new Message
        {
            Id = Guid.NewGuid(),
            GroupId = groupId,
            UserId = user.Id,
            Content = request.Content.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        // Return the created message with user info
        var messageResponse = new MessageResponse
        {
            Id = message.Id,
            Content = message.Content,
            CreatedAt = message.CreatedAt,
            IsEdited = message.IsEdited,
            EditedAt = message.EditedAt,
            User = new UserResponse
            {
                Id = user.Id,
                Name = user.Name ?? user.Email,
                Email = user.Email,
                ImageUrl = user.ImageUrl
            }
        };

        // Broadcast the message to all group members via SignalR
        await _hubContext.Clients.Group(groupId.ToString()).SendAsync("ReceiveMessage", messageResponse);

        return CreatedAtAction(nameof(GetGroupMessages), new { groupId }, messageResponse);
    }

    // PUT: api/messages/{messageId}
    [HttpPut("{messageId}")]
    public async Task<ActionResult<MessageResponse>> UpdateMessage(Guid messageId, [FromBody] UpdateMessageRequest request, [FromQuery] string userEmail)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest("Message content is required");
        }

        var message = await _context.Messages
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.Id == messageId);

        if (message == null)
        {
            return NotFound("Message not found");
        }

        // Check if user is the author of the message
        if (message.User.Email != userEmail)
        {
            return Forbid("You can only edit your own messages");
        }

        message.Content = request.Content.Trim();
        message.IsEdited = true;
        message.EditedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var messageResponse = new MessageResponse
        {
            Id = message.Id,
            Content = message.Content,
            CreatedAt = message.CreatedAt,
            IsEdited = message.IsEdited,
            EditedAt = message.EditedAt,
            User = new UserResponse
            {
                Id = message.User.Id,
                Name = message.User.Name ?? message.User.Email,
                Email = message.User.Email,
                ImageUrl = message.User.ImageUrl
            }
        };

        // Broadcast the updated message to all group members via SignalR
        await _hubContext.Clients.Group(message.GroupId.ToString()).SendAsync("ReceiveMessage", messageResponse);

        return Ok(messageResponse);
    }

    // DELETE: api/messages/{messageId}
    [HttpDelete("{messageId}")]
    public async Task<IActionResult> DeleteMessage(Guid messageId, [FromQuery] string userEmail)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var message = await _context.Messages
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.Id == messageId);

        if (message == null)
        {
            return NotFound("Message not found");
        }

        // Check if user is the author of the message or the group owner
        var group = await _context.Groups
            .Include(g => g.Owner)
            .FirstOrDefaultAsync(g => g.Id == message.GroupId);

        if (group == null)
        {
            return NotFound("Group not found");
        }

        if (message.User.Email != userEmail && group.Owner.Email != userEmail)
        {
            return Forbid("You can only delete your own messages or be the group owner");
        }

        var groupId = message.GroupId; // Store group ID before deletion

        _context.Messages.Remove(message);
        await _context.SaveChangesAsync();

        // Notify all group members that a message was deleted
        await _hubContext.Clients.Group(groupId.ToString()).SendAsync("MessageDeleted", messageId);

        return NoContent();
    }
}
