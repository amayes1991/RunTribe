using Supabase;
using Supabase.Storage;
using System.IO;

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
        
        // Initialize the client connection
        try
        {
            _supabase.InitializeAsync().Wait();
            Console.WriteLine($"[SupabaseStorage] Client initialized successfully for bucket: {_bucketName}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SupabaseStorage] Warning: Failed to initialize client: {ex.Message}");
            // Continue anyway - connection might be lazy
        }
    }

    public async Task<string> UploadImageAsync(Stream fileStream, string fileName, string folder = "groups")
    {
        try
        {
            // Ensure client is initialized
            if (!_supabase.IsConnected)
            {
                await _supabase.InitializeAsync();
            }

            // Ensure bucket exists (create if it doesn't)
            await EnsureBucketExistsAsync();

            // Upload file to Supabase Storage
            var filePath = $"{folder}/{fileName}";
            
            Console.WriteLine($"[SupabaseStorage] Uploading {fileName} to bucket '{_bucketName}' at path '{filePath}'");
            
            // Read stream into byte array for upload
            using (var memoryStream = new MemoryStream())
            {
                await fileStream.CopyToAsync(memoryStream);
                var fileBytes = memoryStream.ToArray();
                
                Console.WriteLine($"[SupabaseStorage] File size: {fileBytes.Length} bytes");
                
                var result = await _supabase.Storage
                    .From(_bucketName)
                    .Upload(fileBytes, filePath, new Supabase.Storage.FileOptions
                    {
                        CacheControl = "3600",
                        Upsert = true
                    });
                
                Console.WriteLine($"[SupabaseStorage] Upload result: {result}");
            }

            // Get public URL
            var publicUrl = _supabase.Storage
                .From(_bucketName)
                .GetPublicUrl(filePath);

            Console.WriteLine($"[SupabaseStorage] Public URL: {publicUrl}");
            return publicUrl;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SupabaseStorage] Error uploading to Supabase Storage: {ex.Message}");
            Console.WriteLine($"[SupabaseStorage] Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[SupabaseStorage] Inner exception: {ex.InnerException.Message}");
            }
            throw;
        }
    }

    public async Task<bool> DeleteImageAsync(string filePath)
    {
        try
        {
            await _supabase.Storage
                .From(_bucketName)
                .Remove(filePath);

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
            if (buckets != null)
            {
                var bucketExists = buckets.Any(b => b.Name == _bucketName);

                if (!bucketExists)
                {
                    // Note: Bucket creation might need to be done manually in Supabase dashboard
                    // or via a different API. For now, we'll just log a warning.
                    Console.WriteLine($"Warning: Bucket '{_bucketName}' does not exist. Please create it manually in Supabase dashboard.");
                    Console.WriteLine($"Bucket should be public and allow: image/jpeg, image/png, image/gif, image/webp");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error checking bucket existence: {ex.Message}");
            // Continue anyway - bucket might already exist or need manual creation
        }
    }
}

