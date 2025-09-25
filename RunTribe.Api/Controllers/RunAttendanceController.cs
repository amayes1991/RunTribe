using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RunTribe.Api.DbContext;
using RunTribe.Api.Models;

namespace RunTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RunAttendanceController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RunAttendanceController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/runattendance/run/{runId}
    [HttpGet("run/{runId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetRunAttendees(Guid runId)
    {
        var run = await _context.GroupRuns
            .Include(gr => gr.Attendees)
            .ThenInclude(ra => ra.User)
            .FirstOrDefaultAsync(gr => gr.Id == runId);

        if (run == null)
        {
            return NotFound("Group run not found");
        }

        var attendees = run.Attendees.Select(ra => new
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
        });

        return Ok(attendees);
    }

    // GET: api/runattendance/user/{userEmail}
    [HttpGet("user/{userEmail}")]
    public async Task<ActionResult<IEnumerable<object>>> GetUserAttendance(string userEmail)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return NotFound("User not found");
        }

        var attendance = await _context.RunAttendances
            .Include(ra => ra.GroupRun)
            .ThenInclude(gr => gr.Group)
            .Where(ra => ra.UserId == user.Id)
            .OrderByDescending(ra => ra.CreatedAt)
            .Select(ra => new
            {
                ra.Id,
                ra.Status,
                ra.Notes,
                ra.CreatedAt,
                GroupRun = new
                {
                    ra.GroupRun.Id,
                    ra.GroupRun.Title,
                    ra.GroupRun.RunDateTime,
                    ra.GroupRun.RunLocation,
                    ra.GroupRun.Pace,
                    ra.GroupRun.Distance
                },
                Group = new
                {
                    ra.GroupRun.Group.Id,
                    ra.GroupRun.Group.Name
                }
            })
            .ToListAsync();

        return Ok(attendance);
    }

    // POST: api/runattendance
    [HttpPost]
    public async Task<ActionResult<object>> CreateAttendance([FromBody] CreateAttendanceRequest request, [FromQuery] string userEmail)
    {
        Console.WriteLine($"Received request: GroupRunId={request.GroupRunId}, Status={request.Status}, Notes={request.Notes}");
        Console.WriteLine($"User email: {userEmail}");
        
        if (request == null)
        {
            return BadRequest("Request body is required");
        }
        
        if (request.GroupRunId == Guid.Empty)
        {
            return BadRequest("GroupRunId is required");
        }
        
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return NotFound("User not found");
        }
        Console.WriteLine($"User: {user.Email}");

        var groupRun = await _context.GroupRuns
            .Include(gr => gr.Group)
            .FirstOrDefaultAsync(gr => gr.Id == request.GroupRunId);
        if (groupRun == null)
        {
            return NotFound("Group run not found");
        }
        Console.WriteLine($"Group run: {groupRun.Id}");
        // Check if user is a member of the group
        var isGroupMember = await _context.GroupMembers
            .AnyAsync(gm => gm.GroupId == groupRun.GroupId && gm.UserId == user.Id);
        if (!isGroupMember)
        {
            return StatusCode(403, "You must be a member of the group to attend runs");
        }
        Console.WriteLine($"Is group member: {isGroupMember}");

        // Check if attendance already exists
        var existingAttendance = await _context.RunAttendances
            .FirstOrDefaultAsync(ra => ra.GroupRunId == request.GroupRunId && ra.UserId == user.Id);

        // Parse the status string to enum
        if (!Enum.TryParse<AttendanceStatus>(request.Status, true, out var statusEnum))
        {
            return BadRequest($"Invalid status: {request.Status}. Valid values are: Going, Maybe, NotGoing");
        }
        
        if (existingAttendance != null)
        {
            // Update existing attendance
            existingAttendance.Status = statusEnum;
            existingAttendance.Notes = request.Notes;
            existingAttendance.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            // Create new attendance
            var attendance = new RunAttendance
            {
                GroupRunId = request.GroupRunId,
                UserId = user.Id,
                Status = statusEnum,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow
            };
            _context.RunAttendances.Add(attendance);
        }
        Console.WriteLine($"Attendance created");
        await _context.SaveChangesAsync();
        Console.WriteLine($"Attendance saved");
        var result = new
        {
            GroupRunId = request.GroupRunId,
            Status = statusEnum,
            Notes = request.Notes,
            User = new
            {
                user.Id,
                user.Name,
                user.Email
            }
        };

        return Ok(result);
    }

    // PUT: api/runattendance/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAttendance(Guid id, [FromBody] UpdateAttendanceRequest request, [FromQuery] string userEmail)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var attendance = await _context.RunAttendances
            .Include(ra => ra.User)
            .FirstOrDefaultAsync(ra => ra.Id == id);

        if (attendance == null)
        {
            return NotFound("Attendance record not found");
        }

        // Check if user owns this attendance record
        if (attendance.User.Email != userEmail)
        {
            return StatusCode(403, "You can only update your own attendance");
        }

        // Parse the status string to enum
        if (!Enum.TryParse<AttendanceStatus>(request.Status, true, out var statusEnum))
        {
            return BadRequest($"Invalid status: {request.Status}. Valid values are: Going, Maybe, NotGoing");
        }

        attendance.Status = statusEnum;
        attendance.Notes = request.Notes;
        attendance.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/runattendance/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAttendance(Guid id, [FromQuery] string userEmail)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var attendance = await _context.RunAttendances
            .Include(ra => ra.User)
            .FirstOrDefaultAsync(ra => ra.Id == id);

        if (attendance == null)
        {
            return NotFound("Attendance record not found");
        }

        // Check if user owns this attendance record
        if (attendance.User.Email != userEmail)
        {
            return StatusCode(403, "You can only delete your own attendance");
        }

        _context.RunAttendances.Remove(attendance);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/runattendance/run/{runId}/summary
    [HttpGet("run/{runId}/summary")]
    public async Task<ActionResult<object>> GetRunAttendanceSummary(Guid runId)
    {
        var run = await _context.GroupRuns
            .Include(gr => gr.Attendees)
            .FirstOrDefaultAsync(gr => gr.Id == runId);

        if (run == null)
        {
            return NotFound("Group run not found");
        }

        var summary = new
        {
            TotalAttendees = run.Attendees.Count,
            Going = run.Attendees.Count(ra => ra.Status == AttendanceStatus.Going),
            Maybe = run.Attendees.Count(ra => ra.Status == AttendanceStatus.Maybe),
            NotGoing = run.Attendees.Count(ra => ra.Status == AttendanceStatus.NotGoing)
        };

        return Ok(summary);
    }
}

public class CreateAttendanceRequest
{
    public Guid GroupRunId { get; set; }
    public string Status { get; set; } = "Going";
    public string? Notes { get; set; }
}

public class UpdateAttendanceRequest
{
    public string Status { get; set; } = "Going";
    public string? Notes { get; set; }
}
