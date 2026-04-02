using Platform.Domain.Entities;

namespace Platform.Application.Abstractions;

public interface IModelArtifactRepository
{
    Task<ModelArtifact> AddAsync(ModelArtifact artifact, CancellationToken ct = default);
    Task<ModelArtifact?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ModelArtifact?> GetByTrainingJobIdAsync(Guid trainingJobId, CancellationToken ct = default);
    Task<IReadOnlyList<ModelArtifact>> ListAsync(CancellationToken ct = default);
}
