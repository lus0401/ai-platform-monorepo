using Platform.Application.Abstractions;
using Platform.Application.Dtos;
using Platform.Domain.Entities;

namespace Platform.Application.Services;

public sealed class DatasetService
{
    private readonly IDatasetRepository _repo;

    public DatasetService(IDatasetRepository repo)
    {
        _repo = repo;
    }

    public async Task<DatasetDto> CreateAsync(CreateDatasetRequest req, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            throw new ArgumentException("Name is required.", nameof(req.Name));

        var entity = new Dataset
        {
            Name = req.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim(),
            SourceType = req.SourceType,
            Location = string.IsNullOrWhiteSpace(req.Location) ? null : req.Location.Trim(),
            CreatedByUserId = req.CreatedByUserId,
        };

        var saved = await _repo.AddAsync(entity, ct);

        return new DatasetDto
        {
            Id = saved.Id,
            Name = saved.Name,
            Description = saved.Description,
            SourceType = saved.SourceType,
            Location = saved.Location,
            CreatedByUserId = saved.CreatedByUserId,
            CreatedAtUtc = saved.CreatedAtUtc
        };
    }

    public async Task<IReadOnlyList<DatasetDto>> ListAsync(CancellationToken ct = default)
    {
        var items = await _repo.ListAsync(ct);
        return items.Select(d => new DatasetDto
        {
            Id = d.Id,
            Name = d.Name,
            Description = d.Description,
            SourceType = d.SourceType,
            Location = d.Location,
            CreatedByUserId = d.CreatedByUserId,
            CreatedAtUtc = d.CreatedAtUtc
        }).ToList();
    }

    public async Task<DatasetDto?> GetAsync(Guid id, CancellationToken ct = default)
    {
        var d = await _repo.GetByIdAsync(id, ct);
        if (d is null) return null;

        return new DatasetDto
        {
            Id = d.Id,
            Name = d.Name,
            Description = d.Description,
            SourceType = d.SourceType,
            Location = d.Location,
            CreatedByUserId = d.CreatedByUserId,
            CreatedAtUtc = d.CreatedAtUtc
        };
    }
}