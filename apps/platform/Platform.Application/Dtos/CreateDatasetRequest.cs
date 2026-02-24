using Platform.Domain.Enums;

namespace Platform.Application.Dtos;

public sealed class CreateDatasetRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DataSourceType SourceType { get; set; } = DataSourceType.Other;
    public string? Location { get; set; }

    // V1: 인증 붙이기 전이라 일단 요청으로 받음 (추후 auth로 대체)
    public Guid CreatedByUserId { get; set; }
}