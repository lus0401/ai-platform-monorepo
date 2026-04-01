using Microsoft.EntityFrameworkCore;
using Platform.Application.Abstractions;
using Platform.Domain.Entities;

namespace Platform.Infrastructure.Persistence.Repositories;

public class UserRepository(ApplicationDbContext db) : IUserRepository
{
    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        await db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await db.Users.FindAsync([id], ct);

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken ct = default) =>
        await db.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken, ct);

    public async Task AddAsync(User user, CancellationToken ct = default)
    {
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(User user, CancellationToken ct = default)
    {
        db.Users.Update(user);
        await db.SaveChangesAsync(ct);
    }
}
