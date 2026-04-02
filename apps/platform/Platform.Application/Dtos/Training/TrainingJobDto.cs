namespace Platform.Application.Dtos.Training;

public record TrainingJobDto(
    Guid Id,
    string Name,
    Guid DatasetId,
    Guid CreatedByUserId,
    string Algorithm,
    string ParametersJson,
    string Status,
    int Progress,
    int CurrentEpoch,
    DateTime? StartedAtUtc,
    DateTime? FinishedAtUtc,
    string? ErrorMessage,
    DateTime CreatedAtUtc
);
