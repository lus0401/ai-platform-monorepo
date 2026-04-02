using Platform.Domain.Enums;

namespace Platform.Application.Abstractions;

public enum DatasetJobType { Validation, Merge }

public record DatasetJobInfo
{
    public Guid JobId { get; init; }
    public DatasetJobType Type { get; init; }
    public JobStatus Status { get; set; } = JobStatus.Pending;
    public int Progress { get; set; }
    public string? Error { get; set; }
    public Guid? ResultDatasetId { get; set; }
    public DateTime StartedAt { get; init; } = DateTime.UtcNow;
    public DateTime? FinishedAt { get; set; }
}

public interface IJobTracker
{
    Guid Start(DatasetJobType type);
    void Update(Guid jobId, JobStatus status, int progress = 0, string? error = null, Guid? resultDatasetId = null);
    void Finish(Guid jobId, JobStatus status, string? error = null, Guid? resultDatasetId = null);
    DatasetJobInfo? Get(Guid jobId);
}
