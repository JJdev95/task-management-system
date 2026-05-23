using MediatR;
using TaskForge.Application.Common.Interfaces;

namespace TaskForge.Application.Auth.Commands.ChangePassword;

public sealed class ChangePasswordCommandHandler(
    ICurrentUserService currentUserService,
    IIdentityService identityService)
    : IRequestHandler<ChangePasswordCommand>
{
    public async Task Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        await identityService.ChangePasswordAsync(
            currentUserService.UserId,
            request.CurrentPassword,
            request.NewPassword,
            cancellationToken);
    }
}
