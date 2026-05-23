using System.Security.Claims;
using TaskForge.Application.Common.Exceptions;
using TaskForge.Application.Common.Interfaces;

namespace TaskForge.Api.Services;

public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public string UserId
    {
        get
        {
            var userId = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new UnauthorizedException("A signed-in user is required.");
            }

            return userId;
        }
    }
}
