using Platform.Domain.Common;
using Platform.Domain.Enums;

namespace Platform.Domain.Entities;

public class User : EntityBase
{
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Member;

    // Navigation
    public ICollection<Dataset> Datasets { get; set; } = new List<Dataset>();
    public ICollection<TrainingJob> TrainingJobs { get; set; } = new List<TrainingJob>();
}