using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RunTribe.Api.Models;

public class GroupRun
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string? Content { get; set; }
    
    [Required]
    public Guid AuthorId { get; set; }
    
    [ForeignKey("AuthorId")]
    public User Author { get; set; } = null!;
    
    [Required]
    public Guid GroupId { get; set; }
    
    [ForeignKey("GroupId")]
    public Group Group { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Run scheduling
    public DateTime? RunDateTime { get; set; }
    
    [StringLength(200)]
    public string? RunLocation { get; set; }
    
    [StringLength(100)]
    public string? Pace { get; set; }
    
    [StringLength(100)]
    public string? Distance { get; set; }
    
    [StringLength(500)]
    public string? ImageUrl { get; set; }
    
    // Navigation properties
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<RunAttendance> Attendees { get; set; } = new List<RunAttendance>();
}
