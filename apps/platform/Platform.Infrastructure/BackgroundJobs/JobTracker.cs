using System.Collections.Concurrent;
using Platform.Application.Abstractions;
using Platform.Domain.Enums;

namespace Platform.Infrastructure.BackgroundJobs;

public sealed class JobTracker : IJobTracker
{
    private readonly ConcurrentDictionary<Guid, DatasetJobInfo> _jobs = new();

    public Guid Start(DatasetJobType type)
    {
        var jobId = Guid.NewGuid();
        _jobs[jobId] = new DatasetJobInfo
        {
            JobId = jobId,
            Type = type,
            Status = JobStatus.Pending,
        };
        return jobId;
    }

    public void Update(Guid jobId, JobStatus status, int progress = 0, string? error = null, Guid? resultDatasetId = null)
    {
        if (!_jobs.TryGetValue(jobId, out var info)) return;
        info.Status = status;
        info.Progress = progress;
        info.Error = error;
        if (resultDatasetId.HasValue)
            info.ResultDatasetId = resultDatasetId;
    }

    public void Finish(Guid jobId, JobStatus status, string? error = null, Guid? resultDatasetId = null)
    {
        if (!_jobs.TryGetValue(jobId, out var info)) return;
        info.Status = status;
        info.Error = error;
        info.Progress = status == JobStatus.Succeeded ? 100 : info.Progress;
        info.FinishedAt = DateTime.UtcNow;
        if (resultDatasetId.HasValue)
            info.ResultDatasetId = resultDatasetId;
    }

    public DatasetJobInfo? Get(Guid jobId) =>
        _jobs.TryGetValue(jobId, out var info) ? info : null;
}
