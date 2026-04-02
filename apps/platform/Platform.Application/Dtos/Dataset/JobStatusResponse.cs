namespace Platform.Application.Dtos.Dataset;

public record JobStatusResponse(
    Guid JobId,
    string Type,
    string Status,
    int Progress,
    string? Error,
    Guid? ResultDatasetId,
    DateTime StartedAt,
    DateTime? FinishedAt
);
