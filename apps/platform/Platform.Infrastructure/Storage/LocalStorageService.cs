using Microsoft.Extensions.Configuration;
using Platform.Application.Abstractions;

namespace Platform.Infrastructure.Storage;

/// <summary>
/// V1 로컬 파일시스템 저장소 구현체.
/// V2에서 MinIO(S3 호환)로 교체 시 이 클래스만 교체하면 됩니다.
/// </summary>
public sealed class LocalStorageService(IConfiguration configuration) : IStorageService
{
    private readonly string _basePath =
        configuration["Storage:BasePath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "data");

    public async Task<string> SaveAsync(string category, string fileName, Stream content, CancellationToken ct = default)
    {
        var dir = Path.Combine(_basePath, category);
        Directory.CreateDirectory(dir);

        var filePath = Path.Combine(dir, fileName);
        await using var file = File.Create(filePath);
        await content.CopyToAsync(file, ct);

        return filePath;
    }

    public Task<Stream> ReadAsync(string uri, CancellationToken ct = default)
    {
        if (!File.Exists(uri))
            throw new FileNotFoundException($"File not found: {uri}");

        Stream stream = File.OpenRead(uri);
        return Task.FromResult(stream);
    }

    public Task DeleteAsync(string uri, CancellationToken ct = default)
    {
        if (File.Exists(uri))
            File.Delete(uri);
        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string uri, CancellationToken ct = default) =>
        Task.FromResult(File.Exists(uri));
}
