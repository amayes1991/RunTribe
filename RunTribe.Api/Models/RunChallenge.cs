using System.ComponentModel.DataAnnotations;

namespace RunTribe.Api.Models
{
    public class RunChallenge
    {
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public ChallengeType Type { get; set; }
        
        public double RequiredDistancePerDay { get; set; }
        
        public DateTime StartDate { get; set; }
        
        public DateTime EndDate { get; set; }
        
        public bool IsPublic { get; set; } = true;
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public Guid CreatedByUserId { get; set; }
        public User CreatedBy { get; set; } = null!;
        
        public List<UserChallengeProgress> Participants { get; set; } = new();
    }
    
    public enum ChallengeType
    {
        DailyDistance = 0,
        TotalDistance = 1,
        RunStreak = 2,
        Custom = 3
    }
}
