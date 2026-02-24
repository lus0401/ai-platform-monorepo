using Platform.Domain.Entities;

namespace Platform.Application.Abstractions;

public interface IDatasetRepository
{
    Task<Dataset> AddAsync(Dataset dataset, CancellationToken ct = default);
    Task<IReadOnlyList<Dataset>> ListAsync(CancellationToken ct = default);
    Task<Dataset?> GetByIdAsync(Guid id, CancellationToken ct = default);
}