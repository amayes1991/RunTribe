namespace RunTribe.Api.Models;

public class GroupMember
{
    public Guid Id { get; set; }
    
    public Guid GroupId { get; set; }
    public Group Group { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
} 