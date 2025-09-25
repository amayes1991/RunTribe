using System.ComponentModel.DataAnnotations;

namespace RunTribe.Api.Models
{
    public class UserChallengeProgress
    {
        public Guid Id { get; set; }
        
        public Guid ChallengeId { get; set; }
        public RunChallenge Challenge { get; set; } = null!;
        
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        
        public int DaysCompleted { get; set; } = 0;
        
        public double TotalDistanceLogged { get; set; } = 0;
        
        public DateTime? LastRunDate { get; set; }
        
        public bool IsComplete { get; set; } = false;
        
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Additional fields for streak tracking
        public int CurrentStreak { get; set; } = 0;
        
        public int LongestStreak { get; set; } = 0;
        
        public DateTime? LastStreakDate { get; set; }
    }
}
