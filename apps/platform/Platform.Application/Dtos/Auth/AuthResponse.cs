namespace Platform.Application.Dtos.Auth;

public record AuthResponse(
    string AccessToken,
    DateTime AccessTokenExpiresAt,
    string Name,
    string Email,
    string Role
);
