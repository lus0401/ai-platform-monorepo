namespace Platform.Application.Abstractions;

/// <summary>
/// 파일 저장소 추상화 인터페이스.
/// V1: 로컬 파일시스템 (LocalStorageService)
/// V2: MinIO 전환 예정
/// </summary>
public interface IStorageService
{
    /// <summary>파일을 저장하고 저장된 경로(URI)를 반환합니다.</summary>
    Task<string> SaveAsync(string category, string fileName, Stream content, CancellationToken ct = default);

    /// <summary>저장된 파일을 스트림으로 읽습니다.</summary>
    Task<Stream> ReadAsync(string uri, CancellationToken ct = default);

    /// <summary>파일을 삭제합니다.</summary>
    Task DeleteAsync(string uri, CancellationToken ct = default);

    /// <summary>파일 존재 여부를 확인합니다.</summary>
    Task<bool> ExistsAsync(string uri, CancellationToken ct = default);
}
