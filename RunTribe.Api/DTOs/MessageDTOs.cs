namespace RunTribe.Api.DTOs;

public class CreateMessageRequest
{
    public string Content { get; set; } = string.Empty;
}

public class UpdateMessageRequest
{
    public string Content { get; set; } = string.Empty;
}

public class MessageResponse
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsEdited { get; set; }
    public DateTime? EditedAt { get; set; }
    public UserResponse User { get; set; } = null!;
}

public class UserResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}

