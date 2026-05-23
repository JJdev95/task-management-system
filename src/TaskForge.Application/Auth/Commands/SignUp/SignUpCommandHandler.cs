using MediatR;
using TaskForge.Application.Auth;
using TaskForge.Application.Common.Interfaces;

namespace TaskForge.Application.Auth.Commands.SignUp;

public sealed class SignUpCommandHandler(IIdentityService identityService)
    : IRequestHandler<SignUpCommand, AuthUserDto>
{
    public async Task<AuthUserDto> Handle(SignUpCommand request, CancellationToken cancellationToken)
    {
        return await identityService.SignUpAsync(request.Email, request.Password, cancellationToken);
    }
}
