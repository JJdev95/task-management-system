using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using TaskForge.Application.Auth;
using TaskForge.Application.Common.Exceptions;
using TaskForge.Application.Common.Interfaces;

namespace TaskForge.Infrastructure.Authentication;

public sealed class IdentityService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IOptionsMonitor<BearerTokenOptions> bearerTokenOptions,
    TimeProvider timeProvider)
    : IIdentityService
{
    public async Task<AuthUserDto> SignUpAsync(
        string email,
        string password,
        CancellationToken cancellationToken)
    {
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            throw ToValidationException(result);
        }

        return new AuthUserDto(user.Id, user.Email!);
    }

    public async Task<AuthUserDto> GetUserAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(userId)
            ?? throw new UnauthorizedException("Authenticated user was not found.");

        return new AuthUserDto(user.Id, user.Email!);
    }

    public async Task SignInAsync(string email, string password, CancellationToken cancellationToken)
    {
        signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;
        var result = await signInManager.PasswordSignInAsync(
            email,
            password,
            isPersistent: true,
            lockoutOnFailure: true);

        if (!result.Succeeded)
        {
            throw new UnauthorizedException("Invalid email or password.");
        }
    }

    public async Task RefreshSignInAsync(string refreshToken, CancellationToken cancellationToken)
    {
        var options = bearerTokenOptions.Get(IdentityConstants.BearerScheme);
        var ticket = options.RefreshTokenProtector.Unprotect(refreshToken);

        if (ticket?.Properties.ExpiresUtc is not { } expiresAt ||
            timeProvider.GetUtcNow() >= expiresAt)
        {
            throw new UnauthorizedException("Refresh token is invalid or expired.");
        }

        var user = await signInManager.ValidateSecurityStampAsync(ticket.Principal);
        if (user is null || !await signInManager.CanSignInAsync(user))
        {
            throw new UnauthorizedException("Refresh token is invalid or expired.");
        }

        signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;
        await signInManager.SignInAsync(user, isPersistent: true);
    }

    public async Task SignOutAsync(CancellationToken cancellationToken)
    {
        await signInManager.SignOutAsync();
    }

    public async Task ChangePasswordAsync(
        string userId,
        string currentPassword,
        string newPassword,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(userId) ?? throw new UnauthorizedException("Authenticated user was not found.");

        var result = await userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        if (!result.Succeeded)
        {
            throw ToValidationException(result);
        }
    }

    private static ApplicationValidationException ToValidationException(IdentityResult result)
    {
        var errors = result.Errors
            .GroupBy(error => GetIdentityErrorField(error.Code))
            .ToDictionary(
                group => group.Key,
                group => group.Select(error => error.Description).ToArray());

        return new ApplicationValidationException(errors);
    }

    private static string GetIdentityErrorField(string code)
    {
        if (code.Contains("Password", StringComparison.OrdinalIgnoreCase))
        {
            return "Password";
        }

        if (code.Contains("Email", StringComparison.OrdinalIgnoreCase) ||
            code.Contains("UserName", StringComparison.OrdinalIgnoreCase) ||
            code.Contains("User", StringComparison.OrdinalIgnoreCase))
        {
            return "Email";
        }

        return "Identity";
    }
}
