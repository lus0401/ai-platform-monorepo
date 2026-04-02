namespace Platform.Application.Dtos.Training;

public record StartTrainingJobRequest(
    Guid DatasetId,
    string Name,
    string Algorithm,
    Dictionary<string, object>? Parameters
);
