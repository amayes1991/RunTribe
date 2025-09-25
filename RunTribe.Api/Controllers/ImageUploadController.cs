using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace RunTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImageUploadController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public ImageUploadController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpGet("test")]
    public IActionResult Test()
    {
        var result = new
        {
            message = "ImageUploadController is working!",
            webRootPath = _environment.WebRootPath,
            contentRootPath = _environment.ContentRootPath,
            currentDirectory = Directory.GetCurrentDirectory()
        };
        
        Console.WriteLine($"Test endpoint called: {System.Text.Json.JsonSerializer.Serialize(result)}");
        return Ok(result);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] string type = "groups")
    {
        Console.WriteLine($"UploadImage called with file: {file?.FileName}, size: {file?.Length}, type: {type}");
        
        try
        {
            if (file == null || file.Length == 0)
            {
                Console.WriteLine("No file uploaded");
                return BadRequest("No file uploaded");
            }

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            Console.WriteLine($"File extension: {fileExtension}");
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                Console.WriteLine($"Invalid file type: {fileExtension}");
                return BadRequest("Invalid file type. Only JPG, PNG, and GIF files are allowed.");
            }

            // Validate file size (5MB max)
            if (file.Length > 5 * 1024 * 1024)
            {
                Console.WriteLine($"File too large: {file.Length} bytes");
                return BadRequest("File size too large. Maximum size is 5MB.");
            }

            // Use a simple approach - save to current directory first
            var currentDir = Directory.GetCurrentDirectory();
            var uploadsDir = Path.Combine(currentDir, "uploads", type);
            
            Console.WriteLine($"Current directory: {currentDir}");
            Console.WriteLine($"Uploads directory: {uploadsDir}");

            // Create directory if it doesn't exist
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
                Console.WriteLine($"Created directory: {uploadsDir}");
            }

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsDir, fileName);
            
            Console.WriteLine($"Saving file to: {filePath}");

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            Console.WriteLine($"File saved successfully: {filePath}");

            // Return the URL (relative to the uploads directory)
            var imageUrl = $"/uploads/{type}/{fileName}";
            Console.WriteLine($"Returning image URL: {imageUrl}");
            
            return Ok(new { imageUrl });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in UploadImage: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
