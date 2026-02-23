using Platform.Domain.Common;
using Platform.Domain.Enums;

namespace Platform.Domain.Entities;

public class Dataset : EntityBase
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public DataSourceType SourceType { get; set; } = DataSourceType.Other;

    // e.g. file path, bucket uri, db table info, etc.
    public string? Location { get; set; }

    // FK
    public Guid CreatedByUserId { get; set; }

    // Navigation
    public User? CreatedByUser { get; set; }
    public ICollection<TrainingJob> TrainingJobs { get; set; } = new List<TrainingJob>();
}