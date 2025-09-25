using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RunTribe.Api.Models;

public class IndividualRun
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    public Guid UserId { get; set; }
    
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
    
    [Required]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    [Required]
    public DateTime RunDate { get; set; }
    
    [Required]
    public int Duration { get; set; } // Duration in seconds
    
    [Required]
    [Column(TypeName = "decimal(8,2)")]
    public decimal Distance { get; set; } // in miles
    
    [StringLength(50)]
    public string? Pace { get; set; } // e.g., "8:30/mile"
    
    [StringLength(200)]
    public string? Location { get; set; }
    
    [StringLength(100)]
    public string? RouteName { get; set; }
    
    [StringLength(500)]
    public string? ImageUrl { get; set; }
    
    // Weather and conditions
    [StringLength(100)]
    public string? Weather { get; set; }
    
    [StringLength(100)]
    public string? Temperature { get; set; }
    
    // Performance metrics
    public int? AverageHeartRate { get; set; }
    
    public int? MaxHeartRate { get; set; }
    
    [Column(TypeName = "decimal(8,2)")]
    public decimal? CaloriesBurned { get; set; }
    
    // Route tracking (for future GPS integration)
    public string? RouteData { get; set; } // JSON string for GPS coordinates
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Tags for categorization
    public string? Tags { get; set; } // Comma-separated tags like "long-run, tempo, trail"
    
    // Personal rating/feeling
    [Range(1, 10)]
    public int? FeelingRating { get; set; } // 1-10 scale
    
    // Whether this was a race
    public bool IsRace { get; set; } = false;
    
    [StringLength(100)]
    public string? RaceName { get; set; }
    
    [StringLength(100)]
    public string? RaceResult { get; set; }
    
    // Shoe tracking
    public Guid? ShoeId { get; set; }
    
    [ForeignKey("ShoeId")]
    public Shoe? Shoe { get; set; }
}
