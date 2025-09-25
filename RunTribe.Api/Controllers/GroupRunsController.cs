using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RunTribe.Api.DbContext;
using RunTribe.Api.Models;

namespace RunTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GroupRunsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public GroupRunsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/groupruns/group/{groupId}
    [HttpGet("group/{groupId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetGroupRuns(Guid groupId, [FromQuery] string? userEmail)
    {
        // First check if the group exists
        var group = await _context.Groups.FirstOrDefaultAsync(g => g.Id == groupId);
        if (group == null)
        {
            return NotFound("Group not found");
        }

        var groupRuns = await _context.GroupRuns
            .Include(gr => gr.Author)
            .Include(gr => gr.Comments)
            .Include(gr => gr.Attendees)
            .Where(gr => gr.GroupId == groupId)
            .OrderByDescending(gr => gr.CreatedAt)
            .Select(gr => new
            {
                gr.Id,
                gr.Title,
                gr.Content,
                gr.CreatedAt,
                gr.UpdatedAt,
                gr.RunDateTime,
                gr.RunLocation,
                gr.Pace,
                gr.Distance,
                gr.ImageUrl,
                Author = new
                {
                    gr.Author.Id,
                    gr.Author.Name,
                    gr.Author.Email
                },
                CommentCount = gr.Comments.Count,
                IsOwner = userEmail != null && gr.Author.Email == userEmail,
                AttendanceSummary = new
                {
                    Total = gr.Attendees.Count,
                    Going = gr.Attendees.Count(ra => ra.Status == AttendanceStatus.Going),
                    Maybe = gr.Attendees.Count(ra => ra.Status == AttendanceStatus.Maybe),
                    NotGoing = gr.Attendees.Count(ra => ra.Status == AttendanceStatus.NotGoing)
                },
                UserAttendance = userEmail != null ? gr.Attendees
                    .Where(ra => ra.User.Email == userEmail)
                    .Select(ra => new { Status = ra.Status.ToString(), ra.Notes })
                    .FirstOrDefault() : null
            })
            .ToListAsync();

        // Always return OK with groupRuns array (empty if no runs)
        return Ok(groupRuns);
    }

    // GET: api/groupruns/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetGroupRun(Guid id, [FromQuery] string? userEmail)
    {
        var groupRun = await _context.GroupRuns
            .Include(gr => gr.Author)
            .Include(gr => gr.Comments)
            .Include(gr => gr.Attendees)
            .ThenInclude(ra => ra.User)
            .FirstOrDefaultAsync(gr => gr.Id == id);

        if (groupRun == null)
        {
            return NotFound();
        }

        var result = new
        {
            groupRun.Id,
            groupRun.Title,
            groupRun.Content,
            groupRun.CreatedAt,
            groupRun.UpdatedAt,
            groupRun.RunDateTime,
            groupRun.RunLocation,
            groupRun.Pace,
            groupRun.Distance,
            groupRun.ImageUrl,
            Author = new
            {
                groupRun.Author.Id,
                groupRun.Author.Name,
                groupRun.Author.Email
            },
            Comments = groupRun.Comments.Select(c => new
            {
                c.Id,
                c.Content,
                c.CreatedAt,
                Author = new
                {
                    c.User.Id,
                    c.User.Name,
                    c.User.Email
                }
            }),
            IsOwner = userEmail != null && groupRun.Author.Email == userEmail,
            AttendanceSummary = new
            {
                Total = groupRun.Attendees.Count,
                Going = groupRun.Attendees.Count(ra => ra.Status == AttendanceStatus.Going),
                Maybe = groupRun.Attendees.Count(ra => ra.Status == AttendanceStatus.Maybe),
                NotGoing = groupRun.Attendees.Count(ra => ra.Status == AttendanceStatus.NotGoing)
            },
            Attendees = groupRun.Attendees.Select(ra => new
            {
                ra.Id,
                ra.Status,
                ra.Notes,
                ra.CreatedAt,
                User = new
                {
                    ra.User.Id,
                    ra.User.Name,
                    ra.User.Email,
                    ra.User.ImageUrl
                }
            }),
            UserAttendance = userEmail != null ? groupRun.Attendees
                .Where(ra => ra.User.Email == userEmail)
                .Select(ra => new { Status = ra.Status.ToString(), ra.Notes })
                .FirstOrDefault() : null
        };

        return Ok(result);
    }

    // POST: api/groupruns
    [HttpPost]
    public async Task<ActionResult<object>> CreateGroupRun([FromBody] CreateGroupRunRequest request, [FromQuery] string userEmail)
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

        var group = await _context.Groups.FirstOrDefaultAsync(g => g.Id == request.GroupId);
        if (group == null)
        {
            return NotFound("Group not found");
        }

        // Check if user is the owner of the group
        if (group.OwnerId != user.Id)
        {
            return StatusCode(403, "Only group owners can schedule runs");
        }

        var groupRun = new GroupRun
        {
            Title = request.Title,
            Content = request.Content,
            AuthorId = user.Id,
            GroupId = request.GroupId,
            RunDateTime = request.RunDateTime,
            RunLocation = request.RunLocation,
            Pace = request.Pace,
            Distance = request.Distance,
            ImageUrl = request.ImageUrl,
            CreatedAt = DateTime.UtcNow
        };

        _context.GroupRuns.Add(groupRun);
        await _context.SaveChangesAsync();

        var result = new
        {
            groupRun.Id,
            groupRun.Title,
            groupRun.Content,
            groupRun.CreatedAt,
            groupRun.RunDateTime,
            groupRun.RunLocation,
            groupRun.Pace,
            groupRun.Distance,
            groupRun.ImageUrl,
            Author = new
            {
                user.Id,
                user.Name,
                user.Email
            },
            CommentCount = 0,
            IsOwner = true
        };

        return CreatedAtAction(nameof(GetGroupRun), new { id = groupRun.Id }, result);
    }

    // PUT: api/groupruns/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGroupRun(Guid id, [FromBody] UpdateGroupRunRequest request, [FromQuery] string userEmail)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var groupRun = await _context.GroupRuns
            .Include(gr => gr.Author)
            .FirstOrDefaultAsync(gr => gr.Id == id);

        if (groupRun == null)
        {
            return NotFound();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return NotFound("User not found");
        }

        // Check if user is the author of the group run
        if (groupRun.AuthorId != user.Id)
        {
            return StatusCode(403, "Only the run author can update this run");
        }

        groupRun.Title = request.Title;
        groupRun.Content = request.Content;
        groupRun.RunDateTime = request.RunDateTime;
        groupRun.RunLocation = request.RunLocation;
        groupRun.Pace = request.Pace;
        groupRun.Distance = request.Distance;
        groupRun.ImageUrl = request.ImageUrl;
        groupRun.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/groupruns/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGroupRun(Guid id, [FromQuery] string userEmail)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var groupRun = await _context.GroupRuns
            .Include(gr => gr.Author)
            .FirstOrDefaultAsync(gr => gr.Id == id);

        if (groupRun == null)
        {
            return NotFound();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return NotFound("User not found");
        }

        // Check if user is the author of the group run
        if (groupRun.AuthorId != user.Id)
        {
            return StatusCode(403, "Only the run author can delete this run");
        }

        _context.GroupRuns.Remove(groupRun);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateGroupRunRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public Guid GroupId { get; set; }
    public DateTime? RunDateTime { get; set; }
    public string? RunLocation { get; set; }
    public string? Pace { get; set; }
    public string? Distance { get; set; }
    public string? ImageUrl { get; set; }
}

public class UpdateGroupRunRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public DateTime? RunDateTime { get; set; }
    public string? RunLocation { get; set; }
    public string? Pace { get; set; }
    public string? Distance { get; set; }
    public string? ImageUrl { get; set; }
}


