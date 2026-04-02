using System.Threading.Channels;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Platform.Application.Abstractions;
using Platform.Domain.Entities;
using Platform.Domain.Enums;

namespace Platform.Infrastructure.BackgroundJobs;

public record MergeWorkItem(Guid JobId, List<Guid> DatasetIds, string NewName, string? Description, Guid CreatedByUserId);

public sealed class DatasetMergeQueue
{
    private readonly Channel<MergeWorkItem> _channel =
        Channel.CreateUnbounded<MergeWorkItem>(new UnboundedChannelOptions { SingleReader = true });

    public ValueTask EnqueueAsync(MergeWorkItem item) =>
        _channel.Writer.WriteAsync(item);

    public IAsyncEnumerable<MergeWorkItem> ReadAllAsync(CancellationToken ct) =>
        _channel.Reader.ReadAllAsync(ct);
}

public sealed class DatasetMergeWorker(
    DatasetMergeQueue queue,
    IJobTracker jobTracker,
    IServiceScopeFactory scopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var item in queue.ReadAllAsync(stoppingToken))
        {
            await ProcessAsync(item, stoppingToken);
        }
    }

    private async Task ProcessAsync(MergeWorkItem item, CancellationToken ct)
    {
        jobTracker.Update(item.JobId, JobStatus.Running, progress: 0);

        try
        {
            using var scope = scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<IDatasetRepository>();

            // 소스 데이터셋 존재 여부 확인
            jobTracker.Update(item.JobId, JobStatus.Running, progress: 10);
            foreach (var datasetId in item.DatasetIds)
            {
                ct.ThrowIfCancellationRequested();
                var source = await repo.GetByIdAsync(datasetId, ct);
                if (source is null)
                {
                    jobTracker.Finish(item.JobId, JobStatus.Failed, error: $"Dataset {datasetId} not found.");
                    return;
                }
            }

            jobTracker.Update(item.JobId, JobStatus.Running, progress: 40);
            await Task.Delay(500, ct);

            // V1: 병합 데이터셋 생성 (실제 파일 복사는 V2 IStorageService에서 처리)
            var merged = new Dataset
            {
                Name            = item.NewName,
                Description     = item.Description,
                SourceType      = DataSourceType.Other,
                Location        = null,
                CreatedByUserId = item.CreatedByUserId,
            };

            jobTracker.Update(item.JobId, JobStatus.Running, progress: 70);
            await Task.Delay(300, ct);

            var saved = await repo.AddAsync(merged, ct);

            jobTracker.Finish(item.JobId, JobStatus.Succeeded, resultDatasetId: saved.Id);
        }
        catch (OperationCanceledException)
        {
            jobTracker.Finish(item.JobId, JobStatus.Canceled);
        }
        catch (Exception ex)
        {
            jobTracker.Finish(item.JobId, JobStatus.Failed, error: ex.Message);
        }
    }
}
