using TaskForge.Application.Auth;

namespace TaskForge.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<AuthUserDto> SignUpAsync(string email, string password, CancellationToken cancellationToken);
    Task<AuthUserDto> GetUserAsync(string userId, CancellationToken cancellationToken);
    Task SignInAsync(string email, string password, CancellationToken cancellationToken);
    Task RefreshSignInAsync(string refreshToken, CancellationToken cancellationToken);
    Task SignOutAsync(CancellationToken cancellationToken);
    Task ChangePasswordAsync(string userId, string currentPassword, string newPassword, CancellationToken cancellationToken);
}
