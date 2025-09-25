using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RunTribe.Api.Models;

public class RunAttendance
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    public Guid GroupRunId { get; set; }
    
    [ForeignKey("GroupRunId")]
    public GroupRun GroupRun { get; set; } = null!;
    
    [Required]
    public Guid UserId { get; set; }
    
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
    
    [Required]
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Going;
    
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
}

public enum AttendanceStatus
{
    Going,
    Maybe,
    NotGoing
}

