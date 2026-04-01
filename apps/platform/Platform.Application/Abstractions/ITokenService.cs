using Platform.Domain.Entities;

namespace Platform.Application.Abstractions;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
