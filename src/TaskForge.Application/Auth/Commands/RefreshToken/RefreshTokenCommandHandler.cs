using MediatR;
using TaskForge.Application.Common.Interfaces;

namespace TaskForge.Application.Auth.Commands.RefreshToken;

public sealed class RefreshTokenCommandHandler(IIdentityService identityService)
    : IRequestHandler<RefreshTokenCommand>
{
    public async Task Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        await identityService.RefreshSignInAsync(request.RefreshToken, cancellationToken);
    }
}
