using Platform.Domain.Entities;

namespace Platform.Application.Abstractions;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
    Task UpdateAsync(User user, CancellationToken ct = default);
}
