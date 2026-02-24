using Microsoft.EntityFrameworkCore;
using Platform.Application.Abstractions;
using Platform.Domain.Entities;
using Platform.Infrastructure.Persistence;

namespace Platform.Infrastructure.Persistence.Repositories;

public sealed class DatasetRepository : IDatasetRepository
{
    private readonly ApplicationDbContext _db;

    public DatasetRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Dataset> AddAsync(Dataset dataset, CancellationToken ct = default)
    {
        _db.Datasets.Add(dataset);
        await _db.SaveChangesAsync(ct);
        return dataset;
    }

    public async Task<IReadOnlyList<Dataset>> ListAsync(CancellationToken ct = default)
    {
        return await _db.Datasets
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(ct);
    }

    public async Task<Dataset?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _db.Datasets
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
    }
}