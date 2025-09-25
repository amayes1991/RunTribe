using Microsoft.EntityFrameworkCore;
using RunTribe.Api.Models;

namespace RunTribe.Api.DbContext;

public class ApplicationDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<GroupMember> GroupMembers { get; set; }
    public DbSet<GroupRun> GroupRuns { get; set; }
    public DbSet<IndividualRun> IndividualRuns { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<RunAttendance> RunAttendances { get; set; }
    public DbSet<Meetup> Meetups { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Shoe> Shoes { get; set; }
    public DbSet<RunChallenge> RunChallenges { get; set; }
    public DbSet<UserChallengeProgress> UserChallengeProgresses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
        });

        // Configure Group entity
        modelBuilder.Entity<Group>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            
            entity.HasOne(e => e.Owner)
                .WithMany(e => e.OwnedGroups)
                .HasForeignKey(e => e.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure GroupMember entity (many-to-many relationship)
        modelBuilder.Entity<GroupMember>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Group)
                .WithMany(e => e.Members)
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.User)
                .WithMany(e => e.GroupMemberships)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure GroupRun entity
        modelBuilder.Entity<GroupRun>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Content).HasMaxLength(1000);
            entity.Property(e => e.RunLocation).HasMaxLength(200);
            entity.Property(e => e.Pace).HasMaxLength(100);
            entity.Property(e => e.Distance).HasMaxLength(100);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            
            entity.HasOne(e => e.Group)
                .WithMany(e => e.GroupRuns)
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Author)
                .WithMany(e => e.GroupRuns)
                .HasForeignKey(e => e.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure IndividualRun entity
        modelBuilder.Entity<IndividualRun>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.Pace).HasMaxLength(50);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.RouteName).HasMaxLength(100);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.Weather).HasMaxLength(100);
            entity.Property(e => e.Temperature).HasMaxLength(100);
            entity.Property(e => e.RouteData).HasMaxLength(4000); // For GPS coordinates
            entity.Property(e => e.Tags).HasMaxLength(200);
            entity.Property(e => e.RaceName).HasMaxLength(100);
            entity.Property(e => e.RaceResult).HasMaxLength(100);
            
            entity.HasOne(e => e.User)
                .WithMany(e => e.IndividualRuns)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Shoe)
                .WithMany(e => e.Runs)
                .HasForeignKey(e => e.ShoeId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure Shoe entity
        modelBuilder.Entity<Shoe>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Brand).HasMaxLength(100);
            entity.Property(e => e.StartingMiles).HasPrecision(8, 2);
            entity.Property(e => e.MaxMiles).HasPrecision(8, 2);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Comment entity
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired().HasMaxLength(500);
            
            entity.HasOne(e => e.GroupRun)
                .WithMany(e => e.Comments)
                .HasForeignKey(e => e.GroupRunId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.User)
                .WithMany(e => e.Comments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Meetup entity
        modelBuilder.Entity<Meetup>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.LocationName).HasMaxLength(200);
            
            entity.HasOne(e => e.Group)
                .WithMany(e => e.Meetups)
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Creator)
                .WithMany(e => e.CreatedMeetups)
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Message entity
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired().HasMaxLength(1000);
            
            entity.HasOne(e => e.Group)
                .WithMany(e => e.Messages)
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.User)
                .WithMany(e => e.Messages)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure RunAttendance entity
        modelBuilder.Entity<RunAttendance>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Notes).HasMaxLength(500);
            
            entity.HasOne(e => e.GroupRun)
                .WithMany(e => e.Attendees)
                .HasForeignKey(e => e.GroupRunId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.User)
                .WithMany(e => e.RunAttendances)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure RunChallenge entity
        modelBuilder.Entity<RunChallenge>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Type).HasConversion<int>();
            
            entity.HasOne(e => e.CreatedBy)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasMany(e => e.Participants)
                .WithOne(e => e.Challenge)
                .HasForeignKey(e => e.ChallengeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure UserChallengeProgress entity
        modelBuilder.Entity<UserChallengeProgress>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Challenge)
                .WithMany(e => e.Participants)
                .HasForeignKey(e => e.ChallengeId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
                
            // Ensure one progress record per user per challenge
            entity.HasIndex(e => new { e.ChallengeId, e.UserId }).IsUnique();
        });
    }
}