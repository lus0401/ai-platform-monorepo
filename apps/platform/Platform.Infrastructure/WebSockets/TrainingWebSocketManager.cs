using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;

namespace Platform.Infrastructure.WebSockets;

public sealed class TrainingWebSocketManager
{
    private readonly ConcurrentDictionary<Guid, ConcurrentBag<WebSocket>> _connections = new();

    public void Add(Guid jobId, WebSocket ws)
    {
        _connections.GetOrAdd(jobId, _ => new ConcurrentBag<WebSocket>()).Add(ws);
    }

    public void Remove(Guid jobId, WebSocket ws)
    {
        if (!_connections.TryGetValue(jobId, out var bag)) return;

        // ConcurrentBag은 직접 삭제가 안 되므로 ws 외 나머지로 교체
        var remaining = bag.Where(s => s != ws && s.State == WebSocketState.Open).ToList();
        var newBag = new ConcurrentBag<WebSocket>(remaining);
        _connections[jobId] = newBag;
    }

    public async Task BroadcastAsync(Guid jobId, string message, CancellationToken ct = default)
    {
        if (!_connections.TryGetValue(jobId, out var bag)) return;

        var bytes = Encoding.UTF8.GetBytes(message);
        var segment = new ArraySegment<byte>(bytes);

        foreach (var ws in bag.Where(s => s.State == WebSocketState.Open))
        {
            try
            {
                await ws.SendAsync(segment, WebSocketMessageType.Text, true, ct);
            }
            catch
            {
                // 개별 전송 실패는 무시 — 끊긴 클라이언트는 Remove에서 정리됨
            }
        }
    }

    public int ConnectionCount(Guid jobId) =>
        _connections.TryGetValue(jobId, out var bag)
            ? bag.Count(s => s.State == WebSocketState.Open)
            : 0;
}
