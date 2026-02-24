using Platform.Domain.Enums;

namespace Platform.Application.Dtos;

public sealed class DatasetDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DataSourceType SourceType { get; set; }
    public string? Location { get; set; }

    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}