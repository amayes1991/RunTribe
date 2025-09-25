using System.ComponentModel.DataAnnotations;

namespace RunTribe.Api.Models;

public class Comment
{
    public Guid Id { get; set; }
    
    public Guid GroupRunId { get; set; }
    public GroupRun GroupRun { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    [Required]
    [StringLength(500)]
    public string Content { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
} 