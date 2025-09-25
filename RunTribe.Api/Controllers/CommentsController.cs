using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RunTribe.Api.DbContext;
using RunTribe.Api.Models;

namespace RunTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CommentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/comments/run/{runId}
    [HttpGet("run/{runId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetRunComments(Guid runId, [FromQuery] string? userEmail)
    {
        var comments = await _context.Comments
            .Include(c => c.User)
            .Where(c => c.GroupRunId == runId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Content,
                c.CreatedAt,
                Author = new
                {
                    c.User.Id,
                    c.User.Name,
                    c.User.Email
                },
                IsOwner = userEmail != null && c.User.Email == userEmail
            })
            .ToListAsync();

        return Ok(comments);
    }

    // POST: api/comments
    [HttpPost]
    public async Task<ActionResult<object>> CreateComment([FromBody] CreateCommentRequest request, [FromQuery] string userEmail)
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

        var groupRun = await _context.GroupRuns
            .Include(gr => gr.Group)
            .ThenInclude(g => g.Members)
            .FirstOrDefaultAsync(gr => gr.Id == request.RunId);

        if (groupRun == null)
        {
            return NotFound("Group run not found");
        }

        // Check if user is a member of the group
        var isMember = groupRun.Group.Members.Any(m => m.UserId == user.Id);
        if (!isMember)
        {
            return StatusCode(403, "Only group members can comment on runs");
        }

        var comment = new Comment
        {
            Content = request.Content,
            UserId = user.Id,
            GroupRunId = request.RunId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var result = new
        {
            comment.Id,
            comment.Content,
            comment.CreatedAt,
            Author = new
            {
                user.Id,
                user.Name,
                user.Email
            },
            IsOwner = true
        };

        return CreatedAtAction(nameof(GetRunComments), new { runId = request.RunId }, result);
    }

    // PUT: api/comments/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateComment(Guid id, [FromBody] UpdateCommentRequest request, [FromQuery] string userEmail)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var comment = await _context.Comments
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (comment == null)
        {
            return NotFound();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return NotFound("User not found");
        }

        // Check if user is the author of the comment
        if (comment.UserId != user.Id)
        {
            return StatusCode(403, "Only the comment author can update this comment");
        }

        comment.Content = request.Content;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/comments/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(Guid id, [FromQuery] string userEmail)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var comment = await _context.Comments
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (comment == null)
        {
            return NotFound();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return NotFound("User not found");
        }

        // Check if user is the author of the comment
        if (comment.UserId != user.Id)
        {
            return StatusCode(403, "Only the comment author can delete this comment");
        }

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateCommentRequest
{
    public string Content { get; set; } = string.Empty;
    public Guid RunId { get; set; }
}

public class UpdateCommentRequest
{
    public string Content { get; set; } = string.Empty;
}
