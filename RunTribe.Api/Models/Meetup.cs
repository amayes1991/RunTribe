using System.ComponentModel.DataAnnotations;

namespace RunTribe.Api.Models;

public class Meetup
{
    public Guid Id { get; set; }
    
    public Guid GroupId { get; set; }
    public Group Group { get; set; } = null!;

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    [StringLength(200)]
    public string? LocationName { get; set; }
    
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public DateTime EventDate { get; set; }
    
    public Guid CreatedBy { get; set; }
    public User Creator { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
} 