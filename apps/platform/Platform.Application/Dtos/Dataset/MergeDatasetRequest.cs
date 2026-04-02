namespace Platform.Application.Dtos.Dataset;

public record MergeDatasetRequest(
    List<Guid> DatasetIds,
    string NewName,
    string? Description
);
