using Platform.Application.Abstractions;
using Platform.Application.Dtos.Training;
using Platform.Domain.Entities;
using Platform.Domain.Enums;

namespace Platform.Application.UseCases.Training;

public class DeployModelUseCase(
    ITrainingJobRepository trainingJobRepository,
    IModelArtifactRepository modelArtifactRepository)
{
    public async Task<ModelArtifactDto> ExecuteAsync(
        DeployModelRequest request,
        CancellationToken ct = default)
    {
        var job = await trainingJobRepository.GetByIdAsync(request.TrainingJobId, ct)
            ?? throw new InvalidOperationException($"TrainingJob {request.TrainingJobId} not found.");

        if (job.Status != JobStatus.Succeeded)
            throw new InvalidOperationException($"Only Succeeded jobs can be deployed. Current status: {job.Status}.");

        var existing = await modelArtifactRepository.GetByTrainingJobIdAsync(job.Id, ct);
        if (existing is not null)
            throw new InvalidOperationException($"Model artifact already exists for job {job.Id}.");

        var artifact = new ModelArtifact
        {
            TrainingJobId  = job.Id,
            Name           = request.Name.Trim(),
            Version        = request.Version.Trim(),
            ArtifactUri    = request.ArtifactUri.Trim(),
            MetricsJson    = request.MetricsJson ?? "{}",
            RegisteredAtUtc = DateTime.UtcNow,
        };

        var saved = await modelArtifactRepository.AddAsync(artifact, ct);
        return ToDto(saved);
    }

    // ---

    public static ModelArtifactDto ToDto(ModelArtifact a) => new(
        Id:             a.Id,
        TrainingJobId:  a.TrainingJobId,
        Name:           a.Name,
        Version:        a.Version,
        ArtifactUri:    a.ArtifactUri,
        MetricsJson:    a.MetricsJson,
        RegisteredAtUtc: a.RegisteredAtUtc
    );
}
