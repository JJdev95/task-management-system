using MediatR;
using TaskForge.Application.Common.Interfaces;

namespace TaskForge.Application.Auth.Queries.GetCurrentUser;

public sealed class GetCurrentUserQueryHandler(
    ICurrentUserService currentUserService,
    IIdentityService identityService)
    : IRequestHandler<GetCurrentUserQuery, AuthUserDto>
{
    public Task<AuthUserDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        return identityService.GetUserAsync(currentUserService.UserId, cancellationToken);
    }
}
