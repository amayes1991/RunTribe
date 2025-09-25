using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RunTribe.Api.DbContext;
using RunTribe.Api.Models;

namespace RunTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IndividualRunsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public IndividualRunsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/individualruns/user/{userEmail}
    [HttpGet("user/{userEmail}")]
    public async Task<ActionResult<IEnumerable<object>>> GetUserRuns(string userEmail, [FromQuery] int? page = 1, [FromQuery] int? pageSize = 20)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return NotFound("User not found");
        }

        var query = _context.IndividualRuns
            .Where(r => r.UserId == user.Id)
            .OrderByDescending(r => r.RunDate);

        // Apply pagination
        var skip = (page.Value - 1) * pageSize.Value;
        var runs = await query
            .Skip(skip)
            .Take(pageSize.Value)
            .Select(r => new
            {
                r.Id,
                r.Title,
                r.Notes,
                r.RunDate,
                r.Duration,
                r.Distance,
                r.Pace,
                r.Location,
                r.RouteName,
                r.ImageUrl,
                r.Weather,
                r.Temperature,
                r.AverageHeartRate,
                r.MaxHeartRate,
                r.CaloriesBurned,
                r.Tags,
                r.FeelingRating,
                r.IsRace,
                r.RaceName,
                r.RaceResult,
                r.CreatedAt,
                r.UpdatedAt,
                Shoe = r.ShoeId.HasValue ? new
                {
                    Id = r.ShoeId,
                    Name = r.Shoe != null ? r.Shoe.Name : null
                } : null
            })
            .ToListAsync();

        // Get total count for pagination
        var totalCount = await query.CountAsync();

        return Ok(new
        {
            runs,
            pagination = new
            {
                page = page.Value,
                pageSize = pageSize.Value,
                totalCount,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize.Value)
            }
        });
    }

    // GET: api/individualruns/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetRun(Guid id, [FromQuery] string? userEmail)
    {
        var run = await _context.IndividualRuns
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (run == null)
        {
            return NotFound();
        }

        // Check if user can access this run
        if (userEmail != null && run.User.Email != userEmail)
        {
            return Forbid();
        }

        var result = new
        {
            run.Id,
            run.Title,
            run.Notes,
            run.RunDate,
            run.Duration,
            run.Distance,
            run.Pace,
            run.Location,
            run.RouteName,
            run.ImageUrl,
            run.Weather,
            run.Temperature,
            run.AverageHeartRate,
            run.MaxHeartRate,
            run.CaloriesBurned,
            run.RouteData,
            run.Tags,
            run.FeelingRating,
            run.IsRace,
            run.RaceName,
            run.RaceResult,
            run.CreatedAt,
            run.UpdatedAt,
            User = new
            {
                run.User.Id,
                run.User.Name,
                run.User.Email
            }
        };

        return Ok(result);
    }

    // POST: api/individualruns
    [HttpPost]
    public async Task<ActionResult<object>> CreateRun([FromBody] CreateIndividualRunRequest request, [FromQuery] string userEmail)
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

        var run = new IndividualRun
        {
            Title = request.Title,
            Notes = request.Notes,
            RunDate = request.RunDate,
            Duration = request.Duration,
            Distance = request.Distance,
            Pace = request.Pace,
            Location = request.Location,
            RouteName = request.RouteName,
            ImageUrl = request.ImageUrl,
            Weather = request.Weather,
            Temperature = request.Temperature,
            AverageHeartRate = request.AverageHeartRate,
            MaxHeartRate = request.MaxHeartRate,
            CaloriesBurned = request.CaloriesBurned,
            RouteData = request.RouteData,
            Tags = request.Tags,
            FeelingRating = request.FeelingRating,
            IsRace = request.IsRace,
            RaceName = request.RaceName,
            RaceResult = request.RaceResult,
            ShoeId = request.ShoeId,
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow
        };

        _context.IndividualRuns.Add(run);
        await _context.SaveChangesAsync();

        // Update shoe mileage if a shoe was selected
        if (request.ShoeId.HasValue)
        {
            await UpdateShoeMileage(request.ShoeId.Value, request.Distance);
        }

        var result = new
        {
            run.Id,
            run.Title,
            run.Notes,
            run.RunDate,
            run.Duration,
            run.Distance,
            run.Pace,
            run.Location,
            run.RouteName,
            run.ImageUrl,
            run.Weather,
            run.Temperature,
            run.AverageHeartRate,
            run.MaxHeartRate,
            run.CaloriesBurned,
            run.Tags,
            run.FeelingRating,
            run.IsRace,
            run.RaceName,
            run.RaceResult,
            run.CreatedAt
        };

        return CreatedAtAction(nameof(GetRun), new { id = run.Id }, result);
    }

    // PUT: api/individualruns/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRun(Guid id, [FromBody] UpdateIndividualRunRequest request, [FromQuery] string userEmail)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var run = await _context.IndividualRuns
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (run == null)
        {
            return NotFound();
        }

        // Check if user owns this run
        if (run.User.Email != userEmail)
        {
            return Forbid();
        }

        run.Title = request.Title;
        run.Notes = request.Notes;
        run.RunDate = request.RunDate;
        run.Duration = request.Duration;
        run.Distance = request.Distance;
        run.Pace = request.Pace;
        run.Location = request.Location;
        run.RouteName = request.RouteName;
        run.ImageUrl = request.ImageUrl;
        run.Weather = request.Weather;
        run.Temperature = request.Temperature;
        run.AverageHeartRate = request.AverageHeartRate;
        run.MaxHeartRate = request.MaxHeartRate;
        run.CaloriesBurned = request.CaloriesBurned;
        run.RouteData = request.RouteData;
        run.Tags = request.Tags;
        run.FeelingRating = request.FeelingRating;
        run.IsRace = request.IsRace;
        run.RaceName = request.RaceName;
        run.RaceResult = request.RaceResult;
        run.ShoeId = request.ShoeId;
        run.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/individualruns/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRun(Guid id, [FromQuery] string userEmail)
    {
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is required");
        }

        var run = await _context.IndividualRuns
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (run == null)
        {
            return NotFound();
        }

        // Check if user owns this run
        if (run.User.Email != userEmail)
        {
            return Forbid();
        }

        // Update shoe mileage if this run had a shoe
        if (run.ShoeId.HasValue)
        {
            await UpdateShoeMileage(run.ShoeId.Value, -run.Distance);
        }

        _context.IndividualRuns.Remove(run);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/individualruns/user/{userEmail}/stats
    [HttpGet("user/{userEmail}/stats")]
    public async Task<ActionResult<object>> GetUserStats(string userEmail, [FromQuery] string? period = "all")
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null)
        {
            return NotFound("User not found");
        }

        var query = _context.IndividualRuns
            .Include(r => r.Shoe)
            .Where(r => r.UserId == user.Id);

        // Apply time period filter
        if (period == "week")
        {
            var weekAgo = DateTime.UtcNow.AddDays(-7);
            query = query.Where(r => r.RunDate >= weekAgo);
        }
        else if (period == "month")
        {
            var monthAgo = DateTime.UtcNow.AddMonths(-1);
            query = query.Where(r => r.RunDate >= monthAgo);
        }
        else if (period == "year")
        {
            var yearAgo = DateTime.UtcNow.AddYears(-1);
            query = query.Where(r => r.RunDate >= yearAgo);
        }

        var runs = await query.ToListAsync();

        var stats = new
        {
            totalRuns = runs.Count,
            totalDistance = runs.Sum(r => r.Distance),
            totalDuration = runs.Sum(r => r.Duration),
            averagePace = runs.Any() ? runs.Average(r => PaceHelper.ParsePaceToMinutes(r.Pace)) : 0,
            averageDistance = runs.Any() ? runs.Average(r => r.Distance) : 0,
            averageDuration = runs.Any() ? runs.Average(r => r.Duration / 60.0) : 0,
            longestRun = runs.Any() ? runs.Max(r => r.Distance) : 0,
            fastestPace = runs.Any() ? runs.Min(r => PaceHelper.ParsePaceToMinutes(r.Pace)) : 0,
            totalCalories = runs.Sum(r => r.CaloriesBurned ?? 0),
            raceCount = runs.Count(r => r.IsRace),
            feelingRating = runs.Any() ? runs.Average(r => r.FeelingRating ?? 0) : 0
        };

        return Ok(stats);
    }

    // Helper method to update shoe mileage
    private async Task UpdateShoeMileage(Guid shoeId, decimal mileageChange)
    {
        var shoe = await _context.Shoes.FindAsync(shoeId);
        if (shoe != null)
        {
            // Note: StartingMiles is the initial mileage, we don't update it
            // The actual total mileage would be calculated from runs
            shoe.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}

public class CreateIndividualRunRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime RunDate { get; set; }
    public int Duration { get; set; } // Duration in seconds
    public decimal Distance { get; set; }
    public string? Pace { get; set; }
    public string? Location { get; set; }
    public string? RouteName { get; set; }
    public string? ImageUrl { get; set; }
    public string? Weather { get; set; }
    public string? Temperature { get; set; }
    public int? AverageHeartRate { get; set; }
    public int? MaxHeartRate { get; set; }
    public decimal? CaloriesBurned { get; set; }
    public string? RouteData { get; set; }
    public string? Tags { get; set; }
    public int? FeelingRating { get; set; }
    public bool IsRace { get; set; } = false;
    public string? RaceName { get; set; }
    public string? RaceResult { get; set; }
    public Guid? ShoeId { get; set; }
}

public class UpdateIndividualRunRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime RunDate { get; set; }
    public int Duration { get; set; } // Duration in seconds
    public decimal Distance { get; set; }
    public string? Pace { get; set; }
    public string? Location { get; set; }
    public string? RouteName { get; set; }
    public string? ImageUrl { get; set; }
    public string? Weather { get; set; }
    public string? Temperature { get; set; }
    public int? AverageHeartRate { get; set; }
    public int? MaxHeartRate { get; set; }
    public decimal? CaloriesBurned { get; set; }
    public string? RouteData { get; set; }
    public string? Tags { get; set; }
    public int? FeelingRating { get; set; }
    public bool IsRace { get; set; } = false;
    public string? RaceName { get; set; }
    public string? RaceResult { get; set; }
    public Guid? ShoeId { get; set; }
}

// Helper method to parse pace strings to minutes
public static class PaceHelper
{
    public static double ParsePaceToMinutes(string? pace)
    {
        if (string.IsNullOrEmpty(pace)) return 0;
        
        // Parse pace like "8:30/mile" to minutes
        var parts = pace.Split('/')[0].Split(':');
        if (parts.Length == 2 && double.TryParse(parts[0], out var minutes) && double.TryParse(parts[1], out var seconds))
        {
            return minutes + (seconds / 60.0);
        }
        
        return 0;
    }
}
