using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RunTribe.Api.DbContext;
using RunTribe.Api.Models;
using System.Security.Claims;

namespace RunTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShoeController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ShoeController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/shoe
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetUserShoes()
    {
        var userId = await GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var shoes = await _context.Shoes
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.IsActive)
            .ThenByDescending(s => s.CreatedAt)
            .ToListAsync();

        // Calculate total miles for each shoe
        var shoesWithStats = new List<object>();
        foreach (var shoe in shoes)
        {
            var totalMiles = await _context.IndividualRuns
                .Where(r => r.ShoeId == shoe.Id)
                .SumAsync(r => r.Distance);

            shoesWithStats.Add(new
            {
                shoe.Id,
                shoe.Name,
                shoe.Brand,
                shoe.StartingMiles,
                shoe.MaxMiles,
                shoe.ImageUrl,
                shoe.IsActive,
                shoe.CreatedAt,
                shoe.UpdatedAt,
                TotalMiles = totalMiles
            });
        }

        return Ok(shoesWithStats);
    }

    // GET: api/shoe/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Shoe>> GetShoe(Guid id)
    {
        var userId = await GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var shoe = await _context.Shoes
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (shoe == null)
            return NotFound();

        return Ok(shoe);
    }

    // GET: api/shoe/{id}/stats
    [HttpGet("{id}/stats")]
    public async Task<ActionResult<object>> GetShoeStats(Guid id)
    {
        var userId = await GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var shoe = await _context.Shoes
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (shoe == null)
            return NotFound();

        var runs = await _context.IndividualRuns
            .Where(r => r.ShoeId == id)
            .OrderByDescending(r => r.RunDate)
            .ToListAsync();

        var totalRuns = runs.Count;
        var totalMiles = runs.Sum(r => r.Distance);
        var totalDuration = runs.Sum(r => r.Duration);
        var averagePace = runs.Any() ? runs.Average(r => ParsePaceToMinutes(r.Pace)) : 0;
        var lastRun = runs.FirstOrDefault();

        var monthlyStats = runs
            .GroupBy(r => new { r.RunDate.Year, r.RunDate.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                MonthName = System.Globalization.CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(g.Key.Month),
                TotalMiles = g.Sum(r => r.Distance),
                TotalRuns = g.Count(),
                AveragePace = g.Average(r => ParsePaceToMinutes(r.Pace))
            })
            .OrderByDescending(x => x.Year)
            .ThenByDescending(x => x.Month)
            .ToList();

        return Ok(new
        {
            Shoe = shoe,
            TotalRuns = totalRuns,
            TotalMiles = totalMiles,
            TotalDuration = totalDuration,
            AveragePace = averagePace,
            LastRun = lastRun,
            MonthlyStats = monthlyStats
        });
    }

    // POST: api/shoe
    [HttpPost]
    public async Task<ActionResult<Shoe>> CreateShoe([FromBody] CreateShoeRequest request)
    {
        var userId = await GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Shoe name is required");

        var shoe = new Shoe
        {
            Id = Guid.NewGuid(),
            UserId = userId.Value,
            Name = request.Name.Trim(),
            Brand = request.Brand?.Trim(),
            StartingMiles = request.StartingMiles,
            MaxMiles = request.MaxMiles,
            ImageUrl = request.ImageUrl?.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Shoes.Add(shoe);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetShoe), new { id = shoe.Id }, shoe);
    }

    // PUT: api/shoe/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateShoe(Guid id, [FromBody] UpdateShoeRequest request)
    {
        var userId = await GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var shoe = await _context.Shoes
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (shoe == null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Shoe name is required");

        shoe.Name = request.Name.Trim();
        shoe.Brand = request.Brand?.Trim();
        shoe.StartingMiles = request.StartingMiles;
        shoe.MaxMiles = request.MaxMiles;
        shoe.ImageUrl = request.ImageUrl?.Trim();
        shoe.IsActive = request.IsActive;
        shoe.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/shoe/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteShoe(Guid id)
    {
        var userId = await GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var shoe = await _context.Shoes
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (shoe == null)
            return NotFound();

        // Check if shoe has any runs
        var hasRuns = await _context.IndividualRuns.AnyAsync(r => r.ShoeId == id);
        if (hasRuns)
            return BadRequest("Cannot delete shoe that has associated runs. Consider deactivating it instead.");

        _context.Shoes.Remove(shoe);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/shoe/{id}/deactivate
    [HttpPut("{id}/deactivate")]
    public async Task<IActionResult> DeactivateShoe(Guid id)
    {
        var userId = await GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var shoe = await _context.Shoes
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (shoe == null)
            return NotFound();

        shoe.IsActive = false;
        shoe.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/shoe/{id}/activate
    [HttpPut("{id}/activate")]
    public async Task<IActionResult> ActivateShoe(Guid id)
    {
        var userId = await GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var shoe = await _context.Shoes
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (shoe == null)
            return NotFound();

        shoe.IsActive = true;
        shoe.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<Guid?> GetCurrentUserId()
    {
        var userEmail = Request.Query["userEmail"].ToString();
        if (string.IsNullOrEmpty(userEmail))
            return null;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        return user?.Id;
    }

    private double ParsePaceToMinutes(string? pace)
    {
        if (string.IsNullOrWhiteSpace(pace))
            return 0;

        // Parse pace like "8:30" to minutes (8.5)
        var parts = pace.Split(':');
        if (parts.Length == 2 && 
            double.TryParse(parts[0], out var minutes) && 
            double.TryParse(parts[1], out var seconds))
        {
            return minutes + (seconds / 60.0);
        }

        return 0;
    }
}

public class CreateShoeRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public decimal StartingMiles { get; set; } = 0;
    public decimal? MaxMiles { get; set; }
    public string? ImageUrl { get; set; }
}

public class UpdateShoeRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public decimal StartingMiles { get; set; } = 0;
    public decimal? MaxMiles { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
}
