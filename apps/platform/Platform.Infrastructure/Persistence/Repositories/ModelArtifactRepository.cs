using Microsoft.EntityFrameworkCore;
using Platform.Application.Abstractions;
using Platform.Domain.Entities;

namespace Platform.Infrastructure.Persistence.Repositories;

public sealed class ModelArtifactRepository(ApplicationDbContext db) : IModelArtifactRepository
{
    public async Task<ModelArtifact> AddAsync(ModelArtifact artifact, CancellationToken ct = default)
    {
        db.ModelArtifacts.Add(artifact);
        await db.SaveChangesAsync(ct);
        return artifact;
    }

    public async Task<ModelArtifact?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await db.ModelArtifacts.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<ModelArtifact?> GetByTrainingJobIdAsync(Guid trainingJobId, CancellationToken ct = default) =>
        await db.ModelArtifacts.AsNoTracking().FirstOrDefaultAsync(x => x.TrainingJobId == trainingJobId, ct);

    public async Task<IReadOnlyList<ModelArtifact>> ListAsync(CancellationToken ct = default) =>
        await db.ModelArtifacts
            .AsNoTracking()
            .OrderByDescending(x => x.RegisteredAtUtc)
            .ToListAsync(ct);
}
