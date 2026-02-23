using Microsoft.EntityFrameworkCore;
using Platform.Domain.Entities;

namespace Platform.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Dataset> Datasets => Set<Dataset>();
    public DbSet<TrainingJob> TrainingJobs => Set<TrainingJob>();
    public DbSet<ModelArtifact> ModelArtifacts => Set<ModelArtifact>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User unique email
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // TrainingJob -> ModelArtifact (1:1)
        modelBuilder.Entity<TrainingJob>()
            .HasOne(t => t.ModelArtifact)
            .WithOne(m => m.TrainingJob)
            .HasForeignKey<ModelArtifact>(m => m.TrainingJobId);

        // jsonb columns
        modelBuilder.Entity<TrainingJob>()
            .Property(t => t.ParametersJson)
            .HasColumnType("jsonb");

        modelBuilder.Entity<ModelArtifact>()
            .Property(m => m.MetricsJson)
            .HasColumnType("jsonb");
    }
}