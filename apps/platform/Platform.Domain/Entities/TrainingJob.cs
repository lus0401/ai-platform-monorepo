using Platform.Domain.Common;
using Platform.Domain.Enums;

namespace Platform.Domain.Entities;

public class TrainingJob : EntityBase
{
    public string Name { get; set; } = string.Empty;

    // FK
    public Guid DatasetId { get; set; }
    public Guid CreatedByUserId { get; set; }

    // Training config
    public string Algorithm { get; set; } = string.Empty;

    // Store params as JSON string for flexibility (V1)
    public string ParametersJson { get; set; } = "{}";

    // Status
    public JobStatus Status { get; set; } = JobStatus.Pending;
    public int Progress { get; set; } = 0; // 0..100

    public DateTime? StartedAtUtc { get; set; }
    public DateTime? FinishedAtUtc { get; set; }

    public string? ErrorMessage { get; set; }

    // For MLflow integration later
    public string? MlflowRunId { get; set; }

    // Navigation
    public Dataset? Dataset { get; set; }
    public User? CreatedByUser { get; set; }

    // V1: one job -> one model artifact (optional)
    public ModelArtifact? ModelArtifact { get; set; }
}