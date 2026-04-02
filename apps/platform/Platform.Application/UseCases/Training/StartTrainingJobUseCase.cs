using System.Text.Json;
using Platform.Application.Abstractions;
using Platform.Application.Dtos.Training;
using Platform.Domain.Entities;
using Platform.Domain.Enums;

namespace Platform.Application.UseCases.Training;

public class StartTrainingJobUseCase(
    ITrainingJobRepository trainingJobRepository,
    IDatasetRepository datasetRepository)
{
    public async Task<TrainingJobDto> ExecuteAsync(
        StartTrainingJobRequest request,
        Guid createdByUserId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Name is required.", nameof(request.Name));

        if (string.IsNullOrWhiteSpace(request.Algorithm))
            throw new ArgumentException("Algorithm is required.", nameof(request.Algorithm));

        var dataset = await datasetRepository.GetByIdAsync(request.DatasetId, ct)
            ?? throw new InvalidOperationException($"Dataset {request.DatasetId} not found.");

        var parametersJson = request.Parameters is not null
            ? JsonSerializer.Serialize(request.Parameters)
            : "{}";

        var job = new TrainingJob
        {
            Name            = request.Name.Trim(),
            DatasetId       = dataset.Id,
            CreatedByUserId = createdByUserId,
            Algorithm       = request.Algorithm.Trim(),
            ParametersJson  = parametersJson,
            Status          = JobStatus.Pending,
        };

        var saved = await trainingJobRepository.AddAsync(job, ct);
        return ToDto(saved);
    }

    // ---

    public static TrainingJobDto ToDto(TrainingJob j) => new(
        Id:             j.Id,
        Name:           j.Name,
        DatasetId:      j.DatasetId,
        CreatedByUserId: j.CreatedByUserId,
        Algorithm:      j.Algorithm,
        ParametersJson: j.ParametersJson,
        Status:         j.Status.ToString(),
        Progress:       j.Progress,
        CurrentEpoch:   j.CurrentEpoch,
        StartedAtUtc:   j.StartedAtUtc,
        FinishedAtUtc:  j.FinishedAtUtc,
        ErrorMessage:   j.ErrorMessage,
        CreatedAtUtc:   j.CreatedAtUtc
    );
}
