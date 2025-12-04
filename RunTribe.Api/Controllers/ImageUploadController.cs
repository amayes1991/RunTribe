using Microsoft.AspNetCore.Mvc;
using System.IO;
using RunTribe.Api.Services;

namespace RunTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImageUploadController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly SupabaseStorageService? _supabaseStorage;
    private readonly IConfiguration _configuration;
    private readonly bool _useSupabase;

    public ImageUploadController(
        IWebHostEnvironment environment,
        IConfiguration configuration,
        IServiceProvider serviceProvider)
    {
        _environment = environment;
        _configuration = configuration;
        
        // Check if Supabase is configured
        var supabaseUrl = _configuration["Supabase:Url"];
        var supabaseKey = _configuration["Supabase:ServiceKey"] ?? _configuration["Supabase:AnonKey"];
        _useSupabase = !string.IsNullOrEmpty(supabaseUrl) && !string.IsNullOrEmpty(supabaseKey);

        // Only initialize Supabase if configured
        if (_useSupabase)
        {
            try
            {
                _supabaseStorage = new SupabaseStorageService(configuration);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Warning: Failed to initialize Supabase Storage: {ex.Message}");
                Console.WriteLine("Falling back to local file storage.");
                _useSupabase = false;
            }
        }
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

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            string imageUrl;
            string fullImageUrl;

            if (_useSupabase && _supabaseStorage != null)
            {
                // Upload to Supabase Storage
                Console.WriteLine("Uploading to Supabase Storage...");
                
                using (var stream = file.OpenReadStream())
                {
                    fullImageUrl = await _supabaseStorage.UploadImageAsync(stream, fileName, type);
                }
                
                // For Supabase, the fullImageUrl is the public URL, use it as both
                imageUrl = fullImageUrl;
                
                Console.WriteLine($"File uploaded to Supabase: {fullImageUrl}");
            }
            else
            {
                // Fallback to local file storage
                Console.WriteLine("Using local file storage (Supabase not configured)");
                
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

                var filePath = Path.Combine(uploadsDir, fileName);
                
                Console.WriteLine($"Saving file to: {filePath}");

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                Console.WriteLine($"File saved successfully: {filePath}");

                // Get the base URL from the request
                var request = HttpContext.Request;
                var baseUrl = $"{request.Scheme}://{request.Host}";
                
                // Return the full URL so it works in production
                imageUrl = $"/uploads/{type}/{fileName}";
                fullImageUrl = $"{baseUrl}{imageUrl}";
                
                Console.WriteLine($"Returning image URL: {fullImageUrl}");
            }
            
            // Return both relative and full URL for compatibility
            return Ok(new { 
                imageUrl = imageUrl,  // Relative URL (for getImageUrl utility) or full URL if Supabase
                fullImageUrl = fullImageUrl  // Full URL (for direct use)
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in UploadImage: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
