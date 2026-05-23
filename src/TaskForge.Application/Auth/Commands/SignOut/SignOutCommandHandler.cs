using MediatR;
using TaskForge.Application.Common.Interfaces;

namespace TaskForge.Application.Auth.Commands.SignOut;

public sealed class SignOutCommandHandler(IIdentityService identityService) : IRequestHandler<SignOutCommand>
{
    public async Task Handle(SignOutCommand request, CancellationToken cancellationToken)
    {
        await identityService.SignOutAsync(cancellationToken);
    }
}
