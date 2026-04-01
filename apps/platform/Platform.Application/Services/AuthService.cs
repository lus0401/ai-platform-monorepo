using BCrypt.Net;
using Platform.Application.Abstractions;
using Platform.Application.Dtos.Auth;
using Platform.Domain.Entities;

namespace Platform.Application.Services;

public class AuthService(
    IUserRepository userRepository,
    ITokenService tokenService)
{
    private const int RefreshTokenExpiryDays = 7;

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await userRepository.GetByEmailAsync(request.Email.Trim().ToLower(), ct);
        if (user is null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        return await IssueTokensAsync(user, ct);
    }

    public async Task<AuthResponse?> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var user = await userRepository.GetByRefreshTokenAsync(refreshToken, ct);
        if (user is null)
            return null;

        if (user.RefreshTokenExpiresAtUtc < DateTime.UtcNow)
            return null;

        return await IssueTokensAsync(user, ct);
    }

    public async Task RevokeAsync(string refreshToken, CancellationToken ct = default)
    {
        var user = await userRepository.GetByRefreshTokenAsync(refreshToken, ct);
        if (user is null)
            return;

        user.RefreshToken = null;
        user.RefreshTokenExpiresAtUtc = null;
        user.UpdatedAtUtc = DateTime.UtcNow;
        await userRepository.UpdateAsync(user, ct);
    }

    // ---

    private async Task<AuthResponse> IssueTokensAsync(User user, CancellationToken ct)
    {
        var accessToken = tokenService.GenerateAccessToken(user);
        var refreshToken = tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(RefreshTokenExpiryDays);
        user.UpdatedAtUtc = DateTime.UtcNow;
        await userRepository.UpdateAsync(user, ct);

        var expiresAt = DateTime.UtcNow.AddHours(8);

        return new AuthResponse(
            AccessToken: accessToken,
            AccessTokenExpiresAt: expiresAt,
            Name: user.Name,
            Email: user.Email,
            Role: user.Role.ToString()
        );
    }
}
