namespace Platform.Application.Dtos.Training;

public record DeployModelRequest(
    Guid TrainingJobId,
    string Name,
    string Version,
    string ArtifactUri,
    string? MetricsJson
);
