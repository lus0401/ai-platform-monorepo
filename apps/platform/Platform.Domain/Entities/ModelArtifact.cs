using Platform.Domain.Common;

namespace Platform.Domain.Entities;

public class ModelArtifact : EntityBase
{
    // FK
    public Guid TrainingJobId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Version { get; set; } = "v1";

    // Where the model is stored (e.g., s3://, minio://, local path)
    public string ArtifactUri { get; set; } = string.Empty;

    // Store evaluation metrics as JSON string for flexibility (V1)
    public string MetricsJson { get; set; } = "{}";

    public DateTime RegisteredAtUtc { get; set; } = DateTime.UtcNow;

    // Navigation
    public TrainingJob? TrainingJob { get; set; }
}