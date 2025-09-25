using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RunTribe.Api.Models;

public class Shoe
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    public Guid UserId { get; set; }
    
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? Brand { get; set; }
    
    [Column(TypeName = "decimal(8,2)")]
    public decimal StartingMiles { get; set; } = 0;
    
    [Column(TypeName = "decimal(8,2)")]
    public decimal? MaxMiles { get; set; } // Recommended max miles for the shoe
    
    [StringLength(500)]
    public string? ImageUrl { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    public bool IsActive { get; set; } = true; // Whether the shoe is still in use
    
    // Navigation properties
    public ICollection<IndividualRun> Runs { get; set; } = new List<IndividualRun>();
    public ICollection<GroupRun> GroupRuns { get; set; } = new List<GroupRun>();
}
