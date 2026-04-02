using Microsoft.EntityFrameworkCore;
using Platform.Application.Abstractions;
using Platform.Domain.Entities;

namespace Platform.Infrastructure.Persistence.Repositories;

public sealed class TrainingJobRepository(ApplicationDbContext db) : ITrainingJobRepository
{
    public async Task<TrainingJob> AddAsync(TrainingJob job, CancellationToken ct = default)
    {
        db.TrainingJobs.Add(job);
        await db.SaveChangesAsync(ct);
        return job;
    }

    public async Task<TrainingJob?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await db.TrainingJobs.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<IReadOnlyList<TrainingJob>> ListByDatasetAsync(Guid datasetId, CancellationToken ct = default) =>
        await db.TrainingJobs
            .AsNoTracking()
            .Where(x => x.DatasetId == datasetId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<TrainingJob>> ListAsync(CancellationToken ct = default) =>
        await db.TrainingJobs
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(ct);

    public async Task<TrainingJob> UpdateAsync(TrainingJob job, CancellationToken ct = default)
    {
        db.TrainingJobs.Update(job);
        await db.SaveChangesAsync(ct);
        return job;
    }
}
