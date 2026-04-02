namespace Platform.Application.Dtos.Training;

public record ModelArtifactDto(
    Guid Id,
    Guid TrainingJobId,
    string Name,
    string Version,
    string ArtifactUri,
    string MetricsJson,
    DateTime RegisteredAtUtc
);
