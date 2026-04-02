using Platform.Application.Abstractions;
using Platform.Application.Dtos.Dataset;

namespace Platform.Application.UseCases.Dataset;

public record MergeDatasetResult(Guid JobId);

public class MergeDatasetUseCase(
    IDatasetRepository datasetRepository,
    IJobTracker jobTracker)
{
    public async Task<MergeDatasetResult> ExecuteAsync(
        MergeDatasetRequest request,
        Guid createdByUserId,
        Func<Guid, Task> enqueue,
        CancellationToken ct = default)
    {
        if (request.DatasetIds is null || request.DatasetIds.Count < 2)
            throw new ArgumentException("At least 2 dataset IDs are required.");

        if (string.IsNullOrWhiteSpace(request.NewName))
            throw new ArgumentException("NewName is required.");

        // 소스 데이터셋 존재 여부 사전 검증
        foreach (var id in request.DatasetIds)
        {
            var dataset = await datasetRepository.GetByIdAsync(id, ct)
                ?? throw new InvalidOperationException($"Dataset {id} not found.");
        }

        var jobId = jobTracker.Start(DatasetJobType.Merge);
        await enqueue(jobId);

        return new MergeDatasetResult(jobId);
    }
}
