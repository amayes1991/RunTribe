using Supabase;
using Supabase.Storage;

namespace RunTribe.Api.Services;

public class SupabaseStorageService
{
    private readonly Supabase.Client _supabase;
    private readonly string _bucketName;

    public SupabaseStorageService(IConfiguration configuration)
    {
        var supabaseUrl = configuration["Supabase:Url"];
        var supabaseKey = configuration["Supabase:ServiceKey"] ?? configuration["Supabase:AnonKey"];
        _bucketName = configuration["Supabase:BucketName"] ?? "uploads";

        if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey))
        {
            throw new InvalidOperationException("Supabase configuration is missing. Please set Supabase:Url and Supabase:ServiceKey (or Supabase:AnonKey) in appsettings.json or environment variables.");
        }

        _supabase = new Supabase.Client(supabaseUrl, supabaseKey, new SupabaseOptions
        {
            AutoConnectRealtime = false,
            AutoRefreshToken = false
        });
    }

    public async Task<string> UploadImageAsync(Stream fileStream, string fileName, string folder = "groups")
    {
        try
        {
            // Ensure bucket exists (create if it doesn't)
            await EnsureBucketExistsAsync();

            // Upload file to Supabase Storage
            var filePath = $"{folder}/{fileName}";
            
            // Read stream into byte array for upload
            using (var memoryStream = new MemoryStream())
            {
                await fileStream.CopyToAsync(memoryStream);
                var fileBytes = memoryStream.ToArray();
                
                var result = await _supabase.Storage
                    .From(_bucketName)
                    .Upload(fileBytes, filePath, new FileOptions
                    {
                        CacheControl = "3600",
                        Upsert = true
                    });
            }

            // Get public URL
            var publicUrl = _supabase.Storage
                .From(_bucketName)
                .GetPublicUrl(filePath);

            return publicUrl;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error uploading to Supabase Storage: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            throw;
        }
    }

    public async Task<bool> DeleteImageAsync(string filePath)
    {
        try
        {
            await _supabase.Storage
                .From(_bucketName)
                .Remove(new[] { filePath });

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting from Supabase Storage: {ex.Message}");
            return false;
        }
    }

    private async Task EnsureBucketExistsAsync()
    {
        try
        {
            var buckets = await _supabase.Storage.ListBuckets();
            var bucketExists = buckets.Any(b => b.Name == _bucketName);

            if (!bucketExists)
            {
                await _supabase.Storage.CreateBucket(_bucketName, new BucketOptions
                {
                    Public = true, // Make bucket public so images are accessible
                    FileSizeLimit = 5242880, // 5MB
                    AllowedMimeTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" }
                });
                
                Console.WriteLine($"Created Supabase bucket: {_bucketName}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error ensuring bucket exists: {ex.Message}");
            // Continue anyway - bucket might already exist or need manual creation
        }
    }
}

