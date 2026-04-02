using System.Threading.Channels;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Platform.Application.Abstractions;
using Platform.Domain.Enums;

namespace Platform.Infrastructure.BackgroundJobs;

public record ValidationWorkItem(Guid JobId, Guid DatasetId);

public sealed class DatasetValidationQueue
{
    private readonly Channel<ValidationWorkItem> _channel =
        Channel.CreateUnbounded<ValidationWorkItem>(new UnboundedChannelOptions { SingleReader = true });

    public ValueTask EnqueueAsync(ValidationWorkItem item) =>
        _channel.Writer.WriteAsync(item);

    public IAsyncEnumerable<ValidationWorkItem> ReadAllAsync(CancellationToken ct) =>
        _channel.Reader.ReadAllAsync(ct);
}

public sealed class DatasetValidationWorker(
    DatasetValidationQueue queue,
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

    private async Task ProcessAsync(ValidationWorkItem item, CancellationToken ct)
    {
        jobTracker.Update(item.JobId, JobStatus.Running, progress: 0);

        try
        {
            using var scope = scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<IDatasetRepository>();

            var dataset = await repo.GetByIdAsync(item.DatasetId, ct);
            if (dataset is null)
            {
                jobTracker.Finish(item.JobId, JobStatus.Failed, error: "Dataset not found.");
                return;
            }

            // V1: 실제 파일 검증 대신 단계별 진행률 시뮬레이션
            // V2에서 실제 이미지 파일 존재 여부, 포맷, 손상 여부 검증으로 교체
            for (var i = 1; i <= 5; i++)
            {
                ct.ThrowIfCancellationRequested();
                await Task.Delay(500, ct);
                jobTracker.Update(item.JobId, JobStatus.Running, progress: i * 20);
            }

            jobTracker.Finish(item.JobId, JobStatus.Succeeded);
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
