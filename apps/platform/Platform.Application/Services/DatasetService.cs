using Platform.Application.Abstractions;
using Platform.Application.Dtos;
using Platform.Domain.Entities;
using Platform.Domain.Enums;

namespace Platform.Application.Services;

public sealed class DatasetService(IDatasetRepository repo)
{
    public async Task<DatasetDto> CreateAsync(CreateDatasetRequest req, Guid createdByUserId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            throw new ArgumentException("Name is required.", nameof(req.Name));

        var entity = new Dataset
        {
            Name        = req.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim(),
            SourceType  = req.SourceType,
            Location    = string.IsNullOrWhiteSpace(req.Location) ? null : req.Location.Trim(),
            CreatedByUserId = createdByUserId,
        };

        var saved = await repo.AddAsync(entity, ct);
        return ToDto(saved);
    }

    public async Task<IReadOnlyList<DatasetDto>> ListAsync(CancellationToken ct = default)
    {
        var items = await repo.ListAsync(ct);
        return items.Select(ToDto).ToList();
    }

    public async Task<DatasetDto?> GetAsync(Guid id, CancellationToken ct = default)
    {
        var d = await repo.GetByIdAsync(id, ct);
        return d is null ? null : ToDto(d);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) =>
        await repo.DeleteAsync(id, ct);

    // ---

    private static DatasetDto ToDto(Dataset d) => new()
    {
        Id              = d.Id,
        Name            = d.Name,
        Description     = d.Description,
        SourceType      = d.SourceType,
        Location        = d.Location,
        CreatedByUserId = d.CreatedByUserId,
        CreatedAtUtc    = d.CreatedAtUtc,
    };
}
