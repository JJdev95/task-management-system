using MediatR;
using TaskForge.Application.Common.Interfaces;

namespace TaskForge.Application.Auth.Commands.Login;

public sealed class LoginCommandHandler(IIdentityService identityService) : IRequestHandler<LoginCommand>
{
    public async Task Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        await identityService.SignInAsync(request.Email, request.Password, cancellationToken);
    }
}
