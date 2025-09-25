using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RunTribe.Api.DbContext;
using RunTribe.Api.Models;

namespace RunTribe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChallengeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ChallengeController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/challenge
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetChallenges([FromQuery] string? userEmail)
        {
            var challenges = await _context.RunChallenges
                .Where(c => c.IsActive && c.IsPublic)
                .Include(c => c.CreatedBy)
                .Include(c => c.Participants)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var result = challenges.Select(c => new
            {
                c.Id,
                c.Title,
                c.Description,
                c.Type,
                c.RequiredDistancePerDay,
                c.StartDate,
                c.EndDate,
                c.IsPublic,
                c.CreatedAt,
                CreatedBy = new
                {
                    c.CreatedBy.Id,
                    c.CreatedBy.Name,
                    c.CreatedBy.Email
                },
                ParticipantCount = c.Participants.Count,
                IsJoined = userEmail != null && c.Participants.Any(p => p.User.Email == userEmail),
                DaysRemaining = (c.EndDate - DateTime.UtcNow).Days,
                IsActive = DateTime.UtcNow >= c.StartDate && DateTime.UtcNow <= c.EndDate
            });

            return Ok(result);
        }

        // GET: api/challenge/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetChallenge(Guid id, [FromQuery] string? userEmail)
        {
            var challenge = await _context.RunChallenges
                .Include(c => c.CreatedBy)
                .Include(c => c.Participants)
                    .ThenInclude(p => p.User)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (challenge == null)
                return NotFound();

            var userProgress = userEmail != null 
                ? challenge.Participants.FirstOrDefault(p => p.User.Email == userEmail)
                : null;

            var leaderboard = challenge.Participants
                .OrderByDescending(p => p.TotalDistanceLogged)
                .ThenByDescending(p => p.CurrentStreak)
                .Take(10)
                .Select(p => new
                {
                    p.User.Name,
                    p.User.Email,
                    p.TotalDistanceLogged,
                    p.CurrentStreak,
                    p.DaysCompleted,
                    p.IsComplete
                })
                .ToList();

            var result = new
            {
                challenge.Id,
                challenge.Title,
                challenge.Description,
                challenge.Type,
                challenge.RequiredDistancePerDay,
                challenge.StartDate,
                challenge.EndDate,
                challenge.IsPublic,
                challenge.CreatedAt,
                CreatedBy = new
                {
                    challenge.CreatedBy.Id,
                    challenge.CreatedBy.Name,
                    challenge.CreatedBy.Email
                },
                ParticipantCount = challenge.Participants.Count,
                IsJoined = userProgress != null,
                UserProgress = userProgress != null ? new
                {
                    userProgress.TotalDistanceLogged,
                    userProgress.CurrentStreak,
                    userProgress.LongestStreak,
                    userProgress.DaysCompleted,
                    userProgress.IsComplete,
                    userProgress.LastRunDate
                } : null,
                Leaderboard = leaderboard,
                DaysRemaining = (challenge.EndDate - DateTime.UtcNow).Days,
                IsActive = DateTime.UtcNow >= challenge.StartDate && DateTime.UtcNow <= challenge.EndDate
            };

            return Ok(result);
        }

        // POST: api/challenge
        [HttpPost]
        public async Task<ActionResult<object>> CreateChallenge([FromBody] CreateChallengeRequest request, [FromQuery] string userEmail)
        {
            if (string.IsNullOrEmpty(userEmail))
                return BadRequest("User email is required");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user == null)
                return NotFound("User not found");

            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest("Challenge title is required");

            if (request.StartDate >= request.EndDate)
                return BadRequest("Start date must be before end date");

            var challenge = new RunChallenge
            {
                Id = Guid.NewGuid(),
                Title = request.Title.Trim(),
                Description = request.Description?.Trim() ?? "",
                Type = request.Type,
                RequiredDistancePerDay = request.RequiredDistancePerDay,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                IsPublic = request.IsPublic,
                CreatedByUserId = user.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.RunChallenges.Add(challenge);
            await _context.SaveChangesAsync();

            var result = new
            {
                challenge.Id,
                challenge.Title,
                challenge.Description,
                challenge.Type,
                challenge.RequiredDistancePerDay,
                challenge.StartDate,
                challenge.EndDate,
                challenge.IsPublic,
                challenge.CreatedAt,
                CreatedBy = new
                {
                    user.Id,
                    user.Name,
                    user.Email
                },
                ParticipantCount = 0,
                IsJoined = false
            };

            return CreatedAtAction(nameof(GetChallenge), new { id = challenge.Id }, result);
        }

        // POST: api/challenge/{id}/join
        [HttpPost("{id}/join")]
        public async Task<IActionResult> JoinChallenge(Guid id, [FromQuery] string userEmail)
        {
            if (string.IsNullOrEmpty(userEmail))
                return BadRequest("User email is required");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user == null)
                return NotFound("User not found");

            var challenge = await _context.RunChallenges
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (challenge == null)
                return NotFound("Challenge not found");

            if (!challenge.IsActive)
                return BadRequest("Challenge is not active");

            if (DateTime.UtcNow > challenge.EndDate)
                return BadRequest("Challenge has ended");

            if (challenge.Participants.Any(p => p.UserId == user.Id))
                return BadRequest("User is already participating in this challenge");

            var progress = new UserChallengeProgress
            {
                Id = Guid.NewGuid(),
                ChallengeId = challenge.Id,
                UserId = user.Id,
                JoinedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.UserChallengeProgresses.Add(progress);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Successfully joined challenge" });
        }

        // DELETE: api/challenge/{id}/leave
        [HttpDelete("{id}/leave")]
        public async Task<IActionResult> LeaveChallenge(Guid id, [FromQuery] string userEmail)
        {
            if (string.IsNullOrEmpty(userEmail))
                return BadRequest("User email is required");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user == null)
                return NotFound("User not found");

            var progress = await _context.UserChallengeProgresses
                .FirstOrDefaultAsync(p => p.ChallengeId == id && p.UserId == user.Id);

            if (progress == null)
                return NotFound("User is not participating in this challenge");

            _context.UserChallengeProgresses.Remove(progress);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Successfully left challenge" });
        }

        // GET: api/challenge/my
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<object>>> GetMyChallenges([FromQuery] string userEmail)
        {
            if (string.IsNullOrEmpty(userEmail))
                return BadRequest("User email is required");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user == null)
                return NotFound("User not found");

            var challenges = await _context.UserChallengeProgresses
                .Where(p => p.UserId == user.Id)
                .Include(p => p.Challenge)
                    .ThenInclude(c => c.CreatedBy)
                .Include(p => p.Challenge)
                    .ThenInclude(c => c.Participants)
                .OrderByDescending(p => p.JoinedAt)
                .ToListAsync();

            var result = challenges.Select(p => new
            {
                Challenge = new
                {
                    p.Challenge.Id,
                    p.Challenge.Title,
                    p.Challenge.Description,
                    p.Challenge.Type,
                    p.Challenge.RequiredDistancePerDay,
                    p.Challenge.StartDate,
                    p.Challenge.EndDate,
                    p.Challenge.IsPublic,
                    p.Challenge.CreatedAt,
                    CreatedBy = new
                    {
                        p.Challenge.CreatedBy.Id,
                        p.Challenge.CreatedBy.Name,
                        p.Challenge.CreatedBy.Email
                    },
                    ParticipantCount = p.Challenge.Participants.Count
                },
                Progress = new
                {
                    p.TotalDistanceLogged,
                    p.CurrentStreak,
                    p.LongestStreak,
                    p.DaysCompleted,
                    p.IsComplete,
                    p.LastRunDate,
                    p.JoinedAt
                },
                DaysRemaining = (p.Challenge.EndDate - DateTime.UtcNow).Days,
                IsActive = DateTime.UtcNow >= p.Challenge.StartDate && DateTime.UtcNow <= p.Challenge.EndDate
            });

            return Ok(result);
        }

        private async Task<Guid?> GetCurrentUserId()
        {
            var userEmail = Request.Query["userEmail"].ToString();
            if (string.IsNullOrEmpty(userEmail))
                return null;

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            return user?.Id;
        }
    }

    public class CreateChallengeRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ChallengeType Type { get; set; }
        public double RequiredDistancePerDay { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsPublic { get; set; } = true;
    }
}

