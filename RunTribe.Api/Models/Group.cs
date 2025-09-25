using System.ComponentModel.DataAnnotations;

namespace RunTribe.Api.Models;

public class Group
{
    public Guid Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [StringLength(200)]
    public string? Location { get; set; }
    
    [StringLength(500)]
    public string? ImageUrl { get; set; }
    
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<GroupMember> Members { get; set; } = new List<GroupMember>();
    public ICollection<GroupRun> GroupRuns { get; set; } = new List<GroupRun>();
    public ICollection<Meetup> Meetups { get; set; } = new List<Meetup>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
} 