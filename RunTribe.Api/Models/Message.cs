using System.ComponentModel.DataAnnotations;

namespace RunTribe.Api.Models;

public class Message
{
    public Guid Id { get; set; }
    
    public Guid GroupId { get; set; }
    public Group Group { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    [Required]
    [StringLength(1000)]
    public string Content { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public bool IsEdited { get; set; } = false;
    public DateTime? EditedAt { get; set; }
}

