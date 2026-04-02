using Platform.Domain.Enums;

namespace Platform.Application.Dtos;

public sealed class CreateDatasetRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DataSourceType SourceType { get; set; } = DataSourceType.Other;
    public string? Location { get; set; }
}