using Platform.Domain.Entities;
using Platform.Domain.Enums;

namespace Platform.Application.Abstractions;

public interface ITrainingJobRepository
{
    Task<TrainingJob> AddAsync(TrainingJob job, CancellationToken ct = default);
    Task<TrainingJob?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<TrainingJob>> ListByDatasetAsync(Guid datasetId, CancellationToken ct = default);
    Task<IReadOnlyList<TrainingJob>> ListAsync(CancellationToken ct = default);
    Task<TrainingJob> UpdateAsync(TrainingJob job, CancellationToken ct = default);
}
