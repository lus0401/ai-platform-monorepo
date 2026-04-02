using Platform.Application.Abstractions;

namespace Platform.Application.UseCases.Dataset;

public record ValidateDatasetResult(Guid JobId);

public class ValidateDatasetUseCase(
    IDatasetRepository datasetRepository,
    IJobTracker jobTracker)
{
    public async Task<ValidateDatasetResult> ExecuteAsync(
        Guid datasetId,
        Func<Guid, Task> enqueue,
        CancellationToken ct = default)
    {
        var dataset = await datasetRepository.GetByIdAsync(datasetId, ct)
            ?? throw new InvalidOperationException($"Dataset {datasetId} not found.");

        var jobId = jobTracker.Start(DatasetJobType.Validation);
        await enqueue(jobId);

        return new ValidateDatasetResult(jobId);
    }
}
