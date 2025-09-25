using System.ComponentModel.DataAnnotations;

namespace RunTribe.Api.Models;

public class User
{
    public Guid Id { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    public string? Name { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<GroupMember> GroupMemberships { get; set; } = new List<GroupMember>();
    public ICollection<GroupRun> GroupRuns { get; set; } = new List<GroupRun>();
    public ICollection<IndividualRun> IndividualRuns { get; set; } = new List<IndividualRun>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Group> OwnedGroups { get; set; } = new List<Group>();
    public ICollection<RunAttendance> RunAttendances { get; set; } = new List<RunAttendance>();
    public ICollection<Meetup> CreatedMeetups { get; set; } = new List<Meetup>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
} 